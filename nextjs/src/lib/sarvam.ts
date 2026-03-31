// Sarvam 105B + OpenRouter (Claude Sonnet 4.6) API integration for order generation
// Server-side only — never import this in client components
// FIX 2026-03-31: Smart routing — contested appeals → Claude Sonnet 4.6 (OpenRouter)
//                               — withdrawal + suo_motu → Sarvam 105B (FREE)

const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SONNET_MODEL = 'anthropic/claude-sonnet-4-6';

export interface OrderGenerationRequest {
  orderType: 'contested' | 'withdrawal' | 'suo_motu' | 'appeal';
  caseDetails: string;
  systemPrompt: string;
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
  maxTokens: number = 4096  // sarvam-105b has 128K context window — 4096 output tokens is safe
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

  // Attempt 3: reduced context — trim user content to 50% and use fewer output tokens
  const reducedDetails = normalizedDetails.slice(0, Math.floor(normalizedDetails.length * 0.5));
  try {
    return await callSarvamAPI(normalizedPrompt, reducedDetails, apiKey, 2000);
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
        'X-Title': 'Aadesh AI — Karnataka Land Records',
      },
      body: JSON.stringify({
        model: SONNET_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 8192,  // FIX 2026-03-31: Kannada uses ~10 tokens/word; 4096 cut off at ~330 words. 8192 gives ~800 complete words.
        temperature: 0.3,
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
 *   contested  → Claude Sonnet 4.6 via OpenRouter (₹12/order, 96/100)
 *   withdrawal → Sarvam 105B (FREE, 90/100 for simple orders)
 *   suo_motu   → Sarvam 105B (FREE)
 *   appeal     → Sarvam 105B (legacy fallback)
 */
export async function generateOrderSmart(
  request: OrderGenerationRequest,
  sarvamKey: string,
  openRouterKey?: string
): Promise<OrderGenerationResponse & { degraded?: boolean }> {
  const isContested = request.orderType === 'contested';

  if (isContested && openRouterKey) {
    // Contested appeal — use Sonnet for 550-750 word output
    const normalizedPrompt = normalizeNFKC(request.systemPrompt);
    const normalizedDetails = normalizeNFKC(request.caseDetails);
    try {
      return await callOpenRouterSonnet(normalizedPrompt, normalizedDetails, openRouterKey);
    } catch (err) {
      console.error('Sonnet failed, falling back to Sarvam:', err instanceof Error ? err.message : err);
      // Fallback to Sarvam if Sonnet fails — mark as degraded so caller can surface this
      const fallback = await generateOrder(request, sarvamKey);
      return { ...fallback, degraded: true };
    }
  }

  if (isContested && !openRouterKey) {
    // FIX 2026-03-31: Warn operators when contested order silently falls back due to missing key
    console.warn('[AAD-20] OPENROUTER_API_KEY not set — contested order using Sarvam 105B (degraded quality)');
    const fallback = await generateOrder(request, sarvamKey);
    return { ...fallback, degraded: true };
  }

  // Withdrawal, suo_motu, appeal — use Sarvam (free, correct model for these types)
  return await generateOrder(request, sarvamKey);
}

// Re-export the full V3.2.1 system prompt as DEFAULT_SYSTEM_PROMPT
// The basic 6-rule prompt has been replaced with the full 382-line production prompt
export { buildSystemPrompt as buildFullSystemPrompt } from './system-prompt';
import { buildSystemPrompt } from './system-prompt';
export const DEFAULT_SYSTEM_PROMPT = buildSystemPrompt();
