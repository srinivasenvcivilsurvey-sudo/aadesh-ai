// Sarvam 105B + Direct Anthropic SDK (Claude Sonnet 4.6) API integration for order generation
// Server-side only — never import this in client components
// FIX 2026-03-31: Smart routing — contested appeals → Claude Sonnet 4.6 (OpenRouter)
//                               — withdrawal + suo_motu → Sarvam 105B (FREE)
// P-0.46 2026-04-11: Migrated contested appeal path → Direct Anthropic SDK
//                    Unlocks: adaptive thinking, prompt caching, structured outputs

import Anthropic from '@anthropic-ai/sdk';

const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SONNET_MODEL = 'anthropic/claude-sonnet-4-6';

export interface OrderGenerationRequest {
  orderType: 'contested' | 'withdrawal' | 'suo_motu' | 'appeal';
  caseDetails: string;          // full enriched input (used by Sarvam path + fallback)
  systemPrompt: string;
  // Optional split fields for Anthropic path — enables separate prompt caching
  referenceOrdersBlock?: string; // cacheable reference orders (contextBlock)
  caseInputOnly?: string;        // non-cached: prev cases + new case details
}

export interface OrderGenerationResponse {
  content: string;
  wordCount: number;
  model: string;
  tokensUsed: number;
}

/**
 * NFKC-normalize any string. Mandatory for all Kannada text processing.
 * Prevents silent failures where visually identical characters have different
 * Unicode representations (NFC vs NFD).
 * Blueprint v6.7: "Apply NFKC to ALL inputs: database entries, LLM outputs,
 * user queries, OCR results. Do this BEFORE any guardrail check."
 */
export function normalizeNFKC(text: string): string {
  return text.normalize('NFKC');
}

/**
 * Core Sarvam API call with timeout.
 */
async function callSarvamAPI(
  systemPrompt: string,
  userContent: string,
  apiKey: string,
  maxTokens: number = 8192  // FIX 2026-04-09: was 4096, caused 243-word orders. 750 Kannada words ≈ 3000-4000 tokens; 8192 gives safe headroom.
): Promise<OrderGenerationResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sarvam-105b',  // FIX 2026-03-29: was 'sarvam-m' (small model, 8K ctx). 105B = 90/100 benchmark quality.
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Sarvam API timeout: request took longer than 60 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Sarvam API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';
  const stripped = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const content = normalizeNFKC(stripped);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    content,
    wordCount,
    model: data.model || 'sarvam-105b',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

/**
 * Generate order with auto-recovery:
 *   1. Try with full context
 *   2. If fails → wait 3s → retry with full context
 *   3. If retry fails → try with reduced context (trim user content to 50%)
 *   4. If all fail → throw with Kannada-friendly message
 */
export async function generateOrder(
  request: OrderGenerationRequest,
  apiKey: string
): Promise<OrderGenerationResponse> {
  const normalizedPrompt = normalizeNFKC(request.systemPrompt);
  const normalizedDetails = normalizeNFKC(request.caseDetails);

  // Attempt 1: full context
  try {
    return await callSarvamAPI(normalizedPrompt, normalizedDetails, apiKey);
  } catch (err1) {
    const msg1 = err1 instanceof Error ? err1.message : String(err1);
    console.error('Sarvam attempt 1 failed:', msg1);
    // 422 = context limit — retrying same input won't help, skip to reduced context
    if (msg1.includes('422')) {
      console.error('Context limit hit on attempt 1, skipping to reduced context');
    } else {
      // Wait 3 seconds before retry only for transient errors
      await new Promise(r => setTimeout(r, 3000));

      // Attempt 2: retry with full context
      try {
        return await callSarvamAPI(normalizedPrompt, normalizedDetails, apiKey);
      } catch (err2) {
        console.error('Sarvam attempt 2 failed:', err2 instanceof Error ? err2.message : err2);
      }
    }
  }

  // Attempt 3: reduced context — trim user content to 50% but keep full output token budget
  const reducedDetails = normalizedDetails.slice(0, Math.floor(normalizedDetails.length * 0.5));
  try {
    return await callSarvamAPI(normalizedPrompt, reducedDetails, apiKey, 8192);  // FIX 2026-04-09: was 2000, causing truncated orders on fallback
  } catch (err3) {
    console.error('Sarvam attempt 3 (reduced) failed:', err3 instanceof Error ? err3.message : err3);
    throw new Error('Sarvam API timeout: all 3 attempts failed');
  }
}

/**
 * OpenRouter API call for Claude Sonnet 4.6.
 * Used for contested appeals — expected score 90-96/100, ₹12/order.
 * FIX 2026-03-31: Sonnet reliably follows word count (1,200+ words) unlike Sarvam 105B.
 */
async function callOpenRouterSonnet(
  systemPrompt: string,
  userContent: string,
  apiKey: string
): Promise<OrderGenerationResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000); // 90s timeout for longer output

  let response: Response;
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aadesh-ai.in',
        'X-Title': 'Aadesh AI - Karnataka Land Records',
      },
      body: JSON.stringify({
        model: SONNET_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 8192,  // FIX 2026-03-31: Kannada uses ~10 tokens/word; 4096 cut off at ~330 words. 8192 gives ~800 complete words.
        temperature: 0.3,
        // TODO P-0.46: Add thinking: { type: "adaptive" } when OpenRouter supports Anthropic extended thinking passthrough
      }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('OpenRouter API timeout: request took longer than 90 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';
  const content = normalizeNFKC(rawContent.trim());
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    content,
    wordCount,
    model: SONNET_MODEL,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

/**
 * Smart router: picks model based on order type.
 *   contested  → Claude Sonnet 4.6 via Direct Anthropic SDK (P-0.46, adaptive thinking, caching)
 *               Falls back to OpenRouter if ANTHROPIC_API_KEY missing.
 *               Falls back to Sarvam if both keys missing.
 *   withdrawal → Sarvam 105B (FREE, 90/100 for simple orders)
 *   suo_motu   → Sarvam 105B (FREE)
 *   appeal     → Sarvam 105B (legacy fallback, treated as contested above)
 */
export async function generateOrderSmart(
  request: OrderGenerationRequest,
  sarvamKey: string,
  openRouterKey?: string,
  anthropicKey?: string
): Promise<OrderGenerationResponse & { degraded?: boolean }> {
  // FIX 2026-04-01: UI sends 'appeal', legacy Streamlit sent 'contested' — treat both as Sonnet route
  const isContested = request.orderType === 'contested' || request.orderType === 'appeal';

  if (isContested) {
    const normalizedPrompt = normalizeNFKC(request.systemPrompt);

    // P-0.46 PRIMARY PATH: Direct Anthropic SDK (adaptive thinking + prompt caching)
    const validAnthropicKey = anthropicKey && anthropicKey !== 'your_key_here' ? anthropicKey : undefined;
    if (validAnthropicKey) {
      try {
        const refs = normalizeNFKC(request.referenceOrdersBlock ?? '');
        const caseIn = normalizeNFKC(request.caseInputOnly ?? request.caseDetails);
        return await callAnthropicSonnet(normalizedPrompt, refs, caseIn, false, validAnthropicKey);
      } catch (err) {
        console.error('Anthropic direct call failed, falling back to OpenRouter:', err instanceof Error ? err.message : err);
      }
    }

    // FALLBACK 1: OpenRouter (if Anthropic key missing or failed)
    if (openRouterKey) {
      const normalizedDetails = normalizeNFKC(request.caseDetails);
      try {
        return await callOpenRouterSonnet(normalizedPrompt, normalizedDetails, openRouterKey);
      } catch (err) {
        console.error('OpenRouter Sonnet failed, falling back to Sarvam:', err instanceof Error ? err.message : err);
        const fallback = await generateOrder(request, sarvamKey);
        return { ...fallback, degraded: true };
      }
    }

    // FALLBACK 2: Sarvam (no AI keys at all)
    console.warn('[AAD-20] No Sonnet key available — contested order using Sarvam 105B (degraded quality)');
    const fallback = await generateOrder(request, sarvamKey);
    return { ...fallback, degraded: true };
  }

  // Withdrawal, suo_motu — use Sarvam (free, correct model for these types)
  return await generateOrder(request, sarvamKey);
}

// Re-export the full V3.2.1 system prompt as DEFAULT_SYSTEM_PROMPT
// The basic 6-rule prompt has been replaced with the full 382-line production prompt
export { buildSystemPrompt as buildFullSystemPrompt } from './system-prompt';
import { buildSystemPrompt } from './system-prompt';
export const DEFAULT_SYSTEM_PROMPT = buildSystemPrompt();

// ─────────────────────────────────────────────────────────────────────────────
// P-0.46 / P-0.47 — Direct Anthropic SDK (contested appeal path)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Direct Anthropic SDK call for contested appeals (P-0.46 Option A).
 * Replaces OpenRouter path. Features:
 *   - Adaptive thinking (GA on Sonnet 4.6) — replaces deprecated budget_tokens
 *   - Prompt caching on system prompt + reference orders (90% cost reduction)
 *   - Same OrderGenerationResponse interface as Sarvam/OpenRouter paths
 */
async function callAnthropicSonnet(
  systemPrompt: string,
  referenceOrders: string,   // cacheable: 5-8 reference orders
  caseInput: string,         // NOT cached: changes every order
  isAuditCall: boolean,
  apiKey: string
): Promise<OrderGenerationResponse> {
  const client = new Anthropic({ apiKey });

  // Cache the system prompt and reference orders separately for maximum savings.
  // cache_control { type: 'ephemeral' } = 5-minute TTL (default).
  // With contested appeals (~10/day) the system prompt stays hot continuously.
  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ];
  if (referenceOrders.trim()) {
    systemBlocks.push({
      type: 'text',
      text: referenceOrders,
      cache_control: { type: 'ephemeral' },
    });
  }

  // effort is GA on Sonnet 4.6 but not yet in SDK v0.88 types — extend inline
  type ParamsWithEffort = Anthropic.Messages.MessageCreateParamsNonStreaming & { effort: string };
  const createParams: ParamsWithEffort = {
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },  // Adaptive thinking (P-0.46) — replaces budget_tokens
    effort: isAuditCall ? 'high' : 'medium',
    system: systemBlocks,
    messages: [{ role: 'user', content: caseInput }],
  };

  const response = await client.messages.create(createParams);

  const textBlock = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('No text block in Anthropic response');

  const content = normalizeNFKC(textBlock.text);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Log cache hit stats for cost monitoring
  const u = response.usage;
  console.log('[Anthropic Sonnet] tokens:', {
    input: u.input_tokens,
    output: u.output_tokens,
    cache_read: u.cache_read_input_tokens ?? 0,
    cache_write: u.cache_creation_input_tokens ?? 0,
  });

  return {
    content,
    wordCount,
    model: 'claude-sonnet-4-6',
    tokensUsed: u.input_tokens + u.output_tokens,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// P-0.47 — Structured Outputs: Clarifying Questions
// ─────────────────────────────────────────────────────────────────────────────

const CLARIFYING_QUESTIONS_SCHEMA = {
  name: 'clarifying_questions',
  schema: {
    type: 'object',
    properties: {
      case_type: {
        type: 'string',
        enum: ['appeal', 'suo_motu', 'withdrawal', 'other'],
      },
      case_summary: {
        type: 'string',
        description: '2-3 sentence summary of the case in English',
      },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            question_kannada: { type: 'string' },
            question_english: { type: 'string' },
            field_type: { type: 'string', enum: ['text', 'date', 'select', 'number'] },
            options: { type: 'array', items: { type: 'string' } },
            required: { type: 'boolean' },
          },
          required: ['id', 'question_kannada', 'question_english', 'field_type', 'required'],
        },
        minItems: 3,
        maxItems: 6,
      },
    },
    required: ['case_type', 'case_summary', 'questions'],
  },
};

export interface ClarifyingQuestion {
  id: number;
  question_kannada: string;
  question_english: string;
  field_type: 'text' | 'date' | 'select' | 'number';
  options?: string[];
  required: boolean;
}

export interface ClarifyingQuestionsResult {
  case_type: string;
  case_summary: string;
  questions: ClarifyingQuestion[];
}

/**
 * Read case PDF text and generate officer clarifying questions.
 * Uses Structured Outputs — response is always valid JSON, no parsing errors possible.
 * Blueprint v9.2.2 — P-0.47
 * TODO: Wire to PDF upload → questions screen in Phase 0 Task 14
 */
export async function generateClarifyingQuestions(
  casePdfText: string,
  apiKey: string
): Promise<ClarifyingQuestionsResult> {
  const client = new Anthropic({ apiKey });

  // output_config (Structured Outputs) is not yet in SDK types — cast via unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createParams: any = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    effort: 'medium',
    // Structured Outputs (P-0.47) — guarantees valid JSON schema in response
    output_config: {
      format: {
        type: 'json_schema',
        json_schema: CLARIFYING_QUESTIONS_SCHEMA,
      },
    },
    system: `You are an AI assistant for Karnataka DDLR (Deputy Director of Land Records) officers.
Read the case PDF text and extract the key information.
Return 3-6 clarifying questions the officer must answer before generating the order.
Always include: (1) desired outcome, (2) order date, (3) one case-specific question.
Write questions in both Kannada and English.`,
    messages: [
      {
        role: 'user',
        content: `Read this case file and generate clarifying questions:\n\n${casePdfText}`,
      },
    ],
  };

  const response = await client.messages.create(createParams) as Anthropic.Message;
  const textBlock = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('No text in clarifying questions response');

  // With Structured Outputs, JSON.parse is always safe — no try/catch needed
  return JSON.parse(textBlock.text) as ClarifyingQuestionsResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// P-0.47 — Structured Outputs: Entity Lock extraction
// ─────────────────────────────────────────────────────────────────────────────

const ENTITY_LOCK_SCHEMA = {
  name: 'entity_lock',
  schema: {
    type: 'object',
    properties: {
      survey_numbers: { type: 'array', items: { type: 'string' } },
      party_names: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string', enum: ['appellant', 'respondent', 'witness', 'officer', 'other'] },
          },
          required: ['name', 'role'],
        },
      },
      village_hobli: {
        type: 'object',
        properties: {
          village: { type: 'string' },
          hobli: { type: 'string' },
          taluk: { type: 'string' },
        },
      },
      order_date: { type: 'string' },
      appeal_number: { type: 'string' },
    },
    required: ['survey_numbers', 'party_names'],
  },
};

export interface EntityLockResult {
  survey_numbers: string[];
  party_names: Array<{ name: string; role: string }>;
  village_hobli?: { village: string; hobli: string; taluk: string };
  order_date?: string;
  appeal_number?: string;
}

/**
 * Extract entities from generated order text for officer verification.
 * Officer verifies these before download (BNS legal protection — no silent errors).
 * Uses Structured Outputs (P-0.47) — always valid JSON.
 * TODO: Wire return value to Entity Lock UI screen (Phase 0 Task 15)
 * Blueprint v9.2.2 — P-0.47
 */
export async function extractEntitiesForLock(
  orderText: string,
  apiKey: string
): Promise<EntityLockResult> {
  const client = new Anthropic({ apiKey });

  // output_config (Structured Outputs) is not yet in SDK types — cast via unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createParams: any = {
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    effort: 'medium',
    output_config: {
      format: {
        type: 'json_schema',
        json_schema: ENTITY_LOCK_SCHEMA,
      },
    },
    system: 'Extract all entities from this Karnataka land revenue order. Return survey numbers, party names with roles, village/hobli/taluk, order date, and appeal number exactly as they appear in the text.',
    messages: [{ role: 'user', content: orderText }],
  };

  const response = await client.messages.create(createParams) as Anthropic.Message;
  const textBlock = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('No text in entity extraction response');

  return JSON.parse(textBlock.text) as EntityLockResult;
}
