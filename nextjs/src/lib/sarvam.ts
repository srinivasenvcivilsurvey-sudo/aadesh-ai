// Sarvam 105B API integration for order generation
// Server-side only — never import this in client components

const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';

export interface OrderGenerationRequest {
  orderType: 'appeal' | 'suo_motu';
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
  maxTokens: number = 4096  // FIX 2026-03-29: sarvam-105b has large context (was 3500 for sarvam-m 8K limit)
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
        model: 'sarvam-105b-instruct',  // FIX 2026-03-29: was 'sarvam-m' (small model, 8K ctx). 105B = 90/100 benchmark quality.
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
    model: data.model || 'sarvam-105b-instruct',
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

// Re-export the full V3.2.1 system prompt as DEFAULT_SYSTEM_PROMPT
// The basic 6-rule prompt has been replaced with the full 382-line production prompt
export { buildSystemPrompt as buildFullSystemPrompt } from './system-prompt';
import { buildSystemPrompt } from './system-prompt';
export const DEFAULT_SYSTEM_PROMPT = buildSystemPrompt();
