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

export async function generateOrder(
  request: OrderGenerationRequest,
  apiKey: string
): Promise<OrderGenerationResponse> {
  // NFKC-normalize all text inputs before sending to Sarvam API
  const normalizedPrompt = normalizeNFKC(request.systemPrompt);
  const normalizedDetails = normalizeNFKC(request.caseDetails);

  // 60-second timeout to prevent hanging requests
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
        model: 'sarvam-m',
        messages: [
          {
            role: 'system',
            content: normalizedPrompt,
          },
          {
            role: 'user',
            content: normalizedDetails,
          },
        ],
        max_tokens: 4096,
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
  // FIX: 2026-03-28 — Strip <think>...</think> reasoning tags from Sarvam output
  const rawContent = data.choices?.[0]?.message?.content || '';
  const stripped = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  // NFKC-normalize the AI output before any downstream processing
  const content = normalizeNFKC(stripped);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    content,
    wordCount,
    model: data.model || 'sarvam-m',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

// Re-export the full V3.2.1 system prompt as DEFAULT_SYSTEM_PROMPT
// The basic 6-rule prompt has been replaced with the full 382-line production prompt
export { buildSystemPrompt as buildFullSystemPrompt } from './system-prompt';
import { buildSystemPrompt } from './system-prompt';
export const DEFAULT_SYSTEM_PROMPT = buildSystemPrompt();
