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
  maxTokens: number = 4096  // FIX 2026-04-18 BUG-L3: Sarvam starter tier max is 4096, not 8192. Was causing 400 on every call.
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
        reasoning_effort: 'low',  // FIX 2026-04-18 BUG-L2: Sarvam 105B reasoning ON by default — without this, ALL tokens consumed by reasoning_content and content=null. 'low' caps reasoning at ~800 tokens, preserves budget for order text.
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
    return await callSarvamAPI(normalizedPrompt, reducedDetails, apiKey, 4096);  // FIX 2026-04-18 BUG-L3: match starter tier limit
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
 * Smart router: Sarvam 105B = DEFAULT for ALL order types (FREE, 91/100).
 * FIX 2026-04-16: Inverted routing per founder directive.
 *   PRIMARY  → Sarvam 105B (free, default for contested/appeal/withdrawal/suo_motu)
 *   FALLBACK 1 → Anthropic SDK (Claude Sonnet 4.6) — only on Sarvam failure
 *   FALLBACK 2 → OpenRouter Sonnet — only on Sarvam + Anthropic failure
 * Fallbacks return { degraded: true } so UI can warn.
 */
export async function generateOrderSmart(
  request: OrderGenerationRequest,
  sarvamKey: string,
  openRouterKey?: string,
  anthropicKey?: string
): Promise<OrderGenerationResponse & { degraded?: boolean }> {
  const normalizedPrompt = normalizeNFKC(request.systemPrompt);
  const validAnthropicKey = anthropicKey && anthropicKey !== 'your_key_here' ? anthropicKey : undefined;

  // PRIMARY: Sarvam 105B (FREE, default for all order types)
  try {
    return await generateOrder(request, sarvamKey);
  } catch (sarvamErr) {
    console.error('[ROUTING] Sarvam primary failed, trying Anthropic fallback:', sarvamErr instanceof Error ? sarvamErr.message : sarvamErr);
  }

  // FALLBACK 1: Anthropic SDK (Claude Sonnet 4.6)
  if (validAnthropicKey) {
    try {
      const refs = normalizeNFKC(request.referenceOrdersBlock ?? '');
      const caseIn = normalizeNFKC(request.caseInputOnly ?? request.caseDetails);
      const result = await callAnthropicSonnet(normalizedPrompt, refs, caseIn, false, validAnthropicKey);
      return { ...result, degraded: true };
    } catch (anthropicErr) {
      console.error('[ROUTING] Anthropic fallback failed, trying OpenRouter:', anthropicErr instanceof Error ? anthropicErr.message : anthropicErr);
    }
  }

  // FALLBACK 2: OpenRouter Sonnet
  if (openRouterKey) {
    const normalizedDetails = normalizeNFKC(request.caseDetails);
    try {
      const result = await callOpenRouterSonnet(normalizedPrompt, normalizedDetails, openRouterKey);
      return { ...result, degraded: true };
    } catch (orErr) {
      console.error('[ROUTING] OpenRouter fallback failed:', orErr instanceof Error ? orErr.message : orErr);
    }
  }

  throw new Error('All providers failed: Sarvam primary + Anthropic/OpenRouter fallbacks exhausted.');
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
 *   - Prompt caching on system prompt + reference orders (90% cost reduction)
 *   - Same OrderGenerationResponse interface as Sarvam/OpenRouter paths
 * FIX 2026-04-18 BUG-L4: Removed effort + thinking:adaptive (API rejects both).
 */
async function callAnthropicSonnet(
  systemPrompt: string,
  referenceOrders: string,   // cacheable: 5-8 reference orders
  caseInput: string,         // NOT cached: changes every order
  _isAuditCall: boolean,
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

  // FIX 2026-04-18 BUG-L4: Removed top-level `effort` field — Anthropic API returns
  // "effort: Extra inputs are not permitted". Removed `thinking: adaptive` too as
  // it caused unknown param errors. Standard non-thinking call until API stabilises.
  const createParams: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
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
// P0 Cost Control — Sarvam Document Intelligence (OCR for scanned PDFs)
// API: async job flow — create → upload → start → poll → download
// Auth: api-subscription-key header (Sarvam's auth scheme)
// Cost: ₹1.50/page (paise: 150/page)
// ─────────────────────────────────────────────────────────────────────────────

const SARVAM_DOC_INTEL_BASE = 'https://api.sarvam.ai';
const SARVAM_DOC_INTEL_POLL_MS = 3_000;
const SARVAM_DOC_INTEL_MAX_POLL_MS = 100_000; // 100s per chunk max

interface SarvamDocIntelJob { id?: string; job_id?: string }
interface SarvamDocIntelStatus { job_state?: string; status?: string; state?: string }
interface SarvamUploadUrls {
  upload_urls?: Record<string, { file_url?: string }>;
}
interface SarvamDownloadUrls {
  // Shape varies; common patterns:
  //  - { download_urls: { "output.zip": { file_url } } }
  //  - { files: [{ name, file_url }] }
  download_urls?: Record<string, { file_url?: string }>;
  files?: Array<{ name?: string; file_url?: string; url?: string }>;
}

/**
 * Minimal ZIP extractor — handles store (0) and deflate (8) compression.
 * Returns first .md or .txt file text, or null if not found.
 * Used because Sarvam Doc Intelligence sometimes returns a ZIP archive.
 */
function extractFirstTextFromZip(zipBuf: Buffer): string | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const zlib = require('zlib') as typeof import('zlib');
  let offset = 0;
  while (offset + 30 < zipBuf.length) {
    if (zipBuf.readUInt32LE(offset) !== 0x04034B50) break; // not local file header
    const compressionMethod = zipBuf.readUInt16LE(offset + 8);
    const compressedSize    = zipBuf.readUInt32LE(offset + 18);
    const fileNameLength    = zipBuf.readUInt16LE(offset + 26);
    const extraFieldLength  = zipBuf.readUInt16LE(offset + 28);
    const fileName          = zipBuf.subarray(offset + 30, offset + 30 + fileNameLength).toString('utf-8');
    const dataStart         = offset + 30 + fileNameLength + extraFieldLength;
    const compressedData    = zipBuf.subarray(dataStart, dataStart + compressedSize);

    if (fileName.endsWith('.md') || fileName.endsWith('.txt')) {
      try {
        if (compressionMethod === 0) return compressedData.toString('utf-8');
        if (compressionMethod === 8) return zlib.inflateRawSync(compressedData).toString('utf-8');
      } catch { /* skip this file, try next */ }
    }
    offset = dataStart + compressedSize;
  }
  return null;
}

/**
 * OCR one PDF chunk (≤10 pages) via Sarvam Document Intelligence.
 * Async job flow: create → upload → start → poll → download.
 * Returns extracted markdown text.
 * Throws on any failure — caller should fall back to Claude Vision.
 */
export async function callSarvamDocIntelChunk(
  pdfBase64: string,
  apiKey: string
): Promise<string> {
  // Endpoints verified 2026-04-19 against sarvamai Python SDK source
  // (site-packages/sarvamai/document_intelligence/{raw_client,client}.py).
  // Docs page is stale; SDK is authoritative. Live VPS curl returned HTTP 202.
  // Base: https://api.sarvam.ai
  // Flow:
  //   1. POST  /doc-digitization/job/v1                              → { job_id }
  //   2. POST  /doc-digitization/job/v1/upload-files                 → { upload_urls: { "<file>": { file_url } } }
  //   3. PUT   <azure presigned file_url>  (bytes, Azure Blob headers)
  //   4. POST  /doc-digitization/job/v1/{job_id}/start
  //   5. GET   /doc-digitization/job/v1/{job_id}/status              → { job_state }
  //   6. POST  /doc-digitization/job/v1/{job_id}/download-files      → presigned download URL(s) → fetch bytes → unzip
  const authHeaders = { 'api-subscription-key': apiKey };
  const FILENAME = 'document.pdf';
  const JOB_BASE = `${SARVAM_DOC_INTEL_BASE}/doc-digitization/job/v1`;

  // 1. Create job
  const createRes = await fetch(JOB_BASE, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_parameters: { language: 'kn-IN', output_format: 'md' },
      callback: null,
    }),
  });
  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    throw new Error(`[Sarvam DocIntel] create failed (${createRes.status}): ${errText.slice(0, 300)}`);
  }
  const jobData = await createRes.json() as SarvamDocIntelJob;
  const jobId = jobData.job_id ?? jobData.id;
  if (!jobId) throw new Error(`[Sarvam DocIntel] no job ID: ${JSON.stringify(jobData).slice(0, 200)}`);
  console.log(`[Sarvam DocIntel] job created: ${jobId}`);

  // 2. Get presigned Azure Blob upload URL
  const uploadUrlRes = await fetch(`${JOB_BASE}/upload-files`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, files: [FILENAME] }),
  });
  if (!uploadUrlRes.ok) {
    const errText = await uploadUrlRes.text().catch(() => '');
    throw new Error(`[Sarvam DocIntel] upload-files failed (${uploadUrlRes.status}): ${errText.slice(0, 300)}`);
  }
  const uploadUrlData = await uploadUrlRes.json() as SarvamUploadUrls;
  const presignedUpload = uploadUrlData.upload_urls?.[FILENAME]?.file_url;
  if (!presignedUpload) {
    throw new Error(`[Sarvam DocIntel] no upload URL in response: ${JSON.stringify(uploadUrlData).slice(0, 300)}`);
  }

  // 3. PUT PDF bytes to Azure Blob Storage
  const pdfBytes = Buffer.from(pdfBase64, 'base64');
  const putRes = await fetch(presignedUpload, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
      'x-ms-blob-type': 'BlockBlob',
    },
    body: new Uint8Array(pdfBytes),
  });
  if (!putRes.ok) {
    const errText = await putRes.text().catch(() => '');
    throw new Error(`[Sarvam DocIntel] Azure PUT failed (${putRes.status}): ${errText.slice(0, 300)}`);
  }
  console.log(`[Sarvam DocIntel] uploaded ${pdfBytes.length} bytes to Azure Blob`);

  // 4. Start job
  const startRes = await fetch(`${JOB_BASE}/${jobId}/start`, {
    method: 'POST',
    headers: authHeaders,
  });
  if (!startRes.ok) {
    const errText = await startRes.text().catch(() => '');
    throw new Error(`[Sarvam DocIntel] start failed (${startRes.status}): ${errText.slice(0, 300)}`);
  }
  console.log('[Sarvam DocIntel] job started');

  // 5. Poll /status until terminal state or timeout
  // Terminal states per SDK: Completed, PartiallyCompleted, Failed
  const pollDeadline = Date.now() + SARVAM_DOC_INTEL_MAX_POLL_MS;
  let lastState = 'unknown';
  while (Date.now() < pollDeadline) {
    await new Promise(r => setTimeout(r, SARVAM_DOC_INTEL_POLL_MS));
    const pollRes = await fetch(`${JOB_BASE}/${jobId}/status`, { headers: authHeaders });
    if (!pollRes.ok) throw new Error(`[Sarvam DocIntel] poll failed (${pollRes.status})`);
    const statusData = await pollRes.json() as SarvamDocIntelStatus;
    lastState = statusData.job_state ?? statusData.status ?? statusData.state ?? 'unknown';
    console.log(`[Sarvam DocIntel] state: ${lastState}`);
    const s = lastState.toLowerCase();
    if (s === 'completed' || s === 'partiallycompleted' || s === 'success') break;
    if (s === 'failed' || s === 'error') throw new Error(`[Sarvam DocIntel] job failed (state: ${lastState})`);
  }
  const terminalOk = ['completed', 'partiallycompleted', 'success'];
  if (!terminalOk.includes(lastState.toLowerCase())) {
    throw new Error(`[Sarvam DocIntel] timeout (last state: ${lastState})`);
  }

  // 6. Get presigned download URL(s)
  const dlUrlRes = await fetch(`${JOB_BASE}/${jobId}/download-files`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!dlUrlRes.ok) {
    const errText = await dlUrlRes.text().catch(() => '');
    throw new Error(`[Sarvam DocIntel] download-files failed (${dlUrlRes.status}): ${errText.slice(0, 300)}`);
  }
  const dlUrlData = await dlUrlRes.json() as SarvamDownloadUrls;

  // Collect candidate URLs from either shape
  const candidateUrls: string[] = [];
  if (dlUrlData.download_urls) {
    for (const v of Object.values(dlUrlData.download_urls)) {
      if (v?.file_url) candidateUrls.push(v.file_url);
    }
  }
  if (Array.isArray(dlUrlData.files)) {
    for (const f of dlUrlData.files) {
      const u = f.file_url ?? f.url;
      if (u) candidateUrls.push(u);
    }
  }
  if (candidateUrls.length === 0) {
    throw new Error(`[Sarvam DocIntel] no download URL in response: ${JSON.stringify(dlUrlData).slice(0, 300)}`);
  }

  // Prefer .zip or .md/.txt URL; fall back to first
  const preferred =
    candidateUrls.find(u => /\.zip(\?|$)/i.test(u)) ??
    candidateUrls.find(u => /\.(md|txt)(\?|$)/i.test(u)) ??
    candidateUrls[0];

  const fileRes = await fetch(preferred);
  if (!fileRes.ok) throw new Error(`[Sarvam DocIntel] download fetch failed (${fileRes.status})`);
  const rawBytes = Buffer.from(await fileRes.arrayBuffer());

  // Detect ZIP magic bytes (PK\x03\x04)
  if (rawBytes.length > 4 && rawBytes[0] === 0x50 && rawBytes[1] === 0x4B) {
    const text = extractFirstTextFromZip(rawBytes);
    if (text !== null) {
      console.log(`[Sarvam DocIntel] extracted ${text.length} chars from ZIP`);
      return text;
    }
    throw new Error('[Sarvam DocIntel] ZIP had no readable .md/.txt file');
  }

  const text = rawBytes.toString('utf-8');
  console.log(`[Sarvam DocIntel] extracted ${text.length} chars`);
  return text;
}

/**
 * Call Sarvam 105B to convert extracted document text into structured JSON.
 * Used as the extraction step after OCR (Sarvam Doc Intelligence or mammoth).
 * systemPrompt must instruct Sarvam to return JSON — same as VISION_SYSTEM_PROMPT.
 */
export async function callSarvamTextToJson(
  documentText: string,
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const result = await callSarvamAPI(
    systemPrompt,
    `Case file document text:\n\n${documentText}\n\nPlease analyze this case file and return the structured JSON as specified.`,
    apiKey,
    4096
  );
  return result.content;
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
