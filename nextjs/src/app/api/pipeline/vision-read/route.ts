/**
 * POST /api/pipeline/vision-read
 * Reads a case file and returns a structured summary + questions.
 *
 * PRIMARY path (P0 Cost Control — Sarvam saves ₹40+ per call vs Anthropic):
 *   PDF  → Sarvam Document Intelligence OCR (chunked ≤10 pages) → Sarvam 105B extraction
 *   DOCX → mammoth text extraction → Sarvam 105B extraction
 *
 * FALLBACK path (when Sarvam fails or key missing):
 *   PDF/Image → Claude Vision (existing logic, needs ANTHROPIC_API_KEY with credits)
 *   DOCX      → Claude text analysis
 *
 * Properties validated:
 *   4: Vision_Reader sends all pages to the API
 *   5: Case summary always contains all required fields
 *   6: Vision_Reader always returns 4 to 5 questions
 *
 * v10.0 — P0 Cost Control:
 *   - Sarvam Document Intelligence as primary for PDFs (10-page chunks, parallel)
 *   - Sarvam 105B for structured JSON extraction (text → JSON)
 *   - pdf-lib for 10-page chunking
 *   - Cost logging in paise: ₹1.50/page = 150 paise/page
 *   - LLM_PRIMARY env var (default: sarvam; set to 'claude' to force Claude-only)
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import type { CaseSummary, VisionReadResponse } from '@/lib/pipeline/types';
import { checkDailyLimit, formatResetTime } from '@/lib/pipeline/rateLimiter';
import { checkIpLimit } from '@/lib/ipRateLimiter';
import { callSarvamDocIntelChunk, callSarvamTextToJson } from '@/lib/sarvam';

const VISION_MODEL          = 'claude-sonnet-4-6';
const VISION_TIMEOUT_MS     = 60_000;       // Claude Vision fallback timeout
const SARVAM_PAGE_CAP       = 10;           // Sarvam Doc Intelligence max pages per job
const SARVAM_CHUNK_STAGGER  = 1_500;        // ms stagger between parallel chunk starts
const MAX_RETRIES           = 2;
const RETRY_DELAY_MS        = 2_000;

const VISION_SYSTEM_PROMPT = `You are an AI assistant for Karnataka government officers.
Read the provided case file pages and extract structured information.
Return ONLY valid JSON in this exact format, no other text:
{
  "caseType": "string (e.g. 'contested_appeal', 'withdrawal', 'suo_motu')",
  "parties": {
    "petitioner": "string (appellant/petitioner name, exactly as written in ಮೇಲ್ಮನವಿದಾರರು field)",
    "respondent": "string (primary respondent name, exactly as written in first ಎದುರುದಾರರು entry)"
  },
  "keyFacts": ["fact 1", "fact 2", "fact 3", "..."],
  "reliefSought": "string (what the petitioner is asking for)",
  "extras": {
    "appellantAge": "string or null (age of the appellant if mentioned, e.g. '62 years')",
    "respondent3Age": "string or null (age of 3rd respondent if mentioned)",
    "hearingDates": ["YYYY-MM-DD", "..."],
    "mutationNo": "string or null (mutation / ಕ್ರಮ number if referenced)",
    "mutationDate": "string or null (mutation date if mentioned, ISO preferred)",
    "saleDeedConsideration": "string or null (sale deed consideration amount with unit, e.g. '₹5,00,000')"
  },
  "questions": [
    "Question 1 in Kannada or English",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5 (optional case-specific question)"
  ]
}
Rules:
- parties.petitioner MUST come from the ಮೇಲ್ಮನವಿದಾರರು / Appellant field. parties.respondent MUST come from the first ಎದುರುದಾರರು / Respondent entry. NEVER swap these roles.
- questions array must have 4 to 5 items. The last question should be specific to this case.
- keyFacts must include all survey numbers, case numbers, dates, and party names mentioned.
- extras is OPTIONAL — omit fields or set them to null when the source document does not contain that information. Do NOT fabricate values.
- hearingDates: include every explicit hearing/adjournment date you can find (empty array if none).`;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Anthropic.RateLimitError) return true;
  if (err instanceof Error) {
    return err.message.includes('429') || err.message.toLowerCase().includes('rate limit');
  }
  return false;
}

// ── PDF chunking via pdf-lib ──────────────────────────────────────────────────

async function splitPdfBase64(
  pdfBase64: string,
  maxPages: number
): Promise<{ chunks: string[]; pageCount: number }> {
  const pdfBytes  = Buffer.from(pdfBase64, 'base64');
  const pdfDoc    = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();

  if (pageCount <= maxPages) return { chunks: [pdfBase64], pageCount };

  const chunks: string[] = [];
  for (let start = 0; start < pageCount; start += maxPages) {
    const chunkDoc = await PDFDocument.create();
    const count    = Math.min(maxPages, pageCount - start);
    const indices  = Array.from({ length: count }, (_, i) => start + i);
    const pages    = await chunkDoc.copyPages(pdfDoc, indices);
    pages.forEach((p: import('pdf-lib').PDFPage) => chunkDoc.addPage(p));
    const chunkBytes = await chunkDoc.save();
    chunks.push(Buffer.from(chunkBytes).toString('base64'));
  }
  return { chunks, pageCount };
}

// ── Sarvam Vision orchestrator ────────────────────────────────────────────────

async function callSarvamVisionOCR(
  pdfBase64: string,
  sarvamApiKey: string
): Promise<{ ocrText: string; pageCount: number; chunkCount: number }> {
  const { chunks, pageCount } = await splitPdfBase64(pdfBase64, SARVAM_PAGE_CAP);
  console.log(`[vision-read] Sarvam OCR: ${pageCount} pages → ${chunks.length} chunk(s)`);

  // Parallel with staggered starts (avoids hitting Sarvam rate limit)
  const chunkTexts = await Promise.all(
    chunks.map(async (chunk, i) => {
      if (i > 0) await sleep(i * SARVAM_CHUNK_STAGGER);
      console.log(`[vision-read] Sarvam chunk ${i + 1}/${chunks.length} start`);
      return callSarvamDocIntelChunk(chunk, sarvamApiKey);
    })
  );

  const ocrText = chunkTexts.join('\n\n--- PAGE BREAK ---\n\n');
  return { ocrText, pageCount, chunkCount: chunks.length };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // FIX C9: IP rate limit BEFORE auth
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '0.0.0.0';
  const ipCheck = checkIpLimit(ip);
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfterMs: ipCheck.retryAfterMs },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'ಅನಧಿಕೃತ / Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'ಅನಧಿಕೃತ / Unauthorized' }, { status: 401 });
  }

  // ── Credit + rate-limit check ─────────────────────────────────────────────────
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey ?? 'missing-service-role-key'
  );

  if (!serviceRoleKey) {
    console.warn('[vision-read] SUPABASE_SERVICE_ROLE_KEY not set — skipping credit+rate-limit gate');
  } else {
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[vision-read] Credit check error:', profileError.message, '— proceeding anyway');
    } else if ((profile?.credits_remaining ?? 0) < 1) {
      console.warn('[vision-read] No credits for user:', user.id);
      return NextResponse.json(
        { error: 'No credits remaining. Please recharge / ಕೈಗಳಿಲ್ಲಗಿರುವದನ್ನು. ದಯವಿಟ್ಟು ರಿಚಾರ್ಜ್ ಮಾಡಿ.' },
        { status: 402 }
      );
    }

    const rateLimit = await checkDailyLimit(user.id, adminClient);
    if (!rateLimit.allowed) {
      const resetTime = formatResetTime(rateLimit.resetAt);
      return NextResponse.json(
        { error: `Daily limit reached. Try again after ${resetTime}.`, code: 'RATE_LIMIT_DAILY' },
        { status: 429 }
      );
    }
  }

  try {
    const body = await request.json();
    const { storagePath, fileBase64: legacyBase64, mimeType } = body as {
      storagePath?: string;
      fileBase64?: string;
      mimeType: string;
      pageCount: number;
    };

    if (!mimeType || (!storagePath && !legacyBase64)) {
      return NextResponse.json(
        { error: 'ಫೈಲ್ ಡೇಟಾ ಅಗತ್ಯ / File data required' },
        { status: 400 }
      );
    }

    // Download from Supabase Storage or use legacy base64
    let fileBase64: string;
    if (storagePath) {
      if (!serviceRoleKey) {
        console.error('[vision-read] SUPABASE_SERVICE_ROLE_KEY not set — cannot download from storage');
        return NextResponse.json(
          { error: 'Server storage not configured / ಸರ್ವರ್ ಸಂಗ್ರಹ ಕಾನ್ಫಿಗರ್ ಇಲ್ಲ' },
          { status: 500 }
        );
      }
      console.log('[vision-read] downloading from storage:', storagePath);
      const { data: blob, error: dlError } = await adminClient.storage
        .from('files')
        .download(storagePath);
      if (dlError || !blob) {
        console.error('[vision-read] Supabase download failed:', dlError);
        return NextResponse.json(
          { error: 'File not found in storage / ಫೈಲ್ ಸಂಗ್ರಹದಲ್ಲಿ ಇಲ್ಲ' },
          { status: 404 }
        );
      }
      const buf = Buffer.from(await blob.arrayBuffer());
      fileBase64 = buf.toString('base64');
      console.log('[vision-read] downloaded bytes:', buf.length);
    } else {
      fileBase64 = legacyBase64!;
    }

    const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isPdf  = mimeType === 'application/pdf';

    // ── DOCX: extract text with mammoth ────────────────────────────────────────
    let docxText: string | null = null;
    if (isDocx) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const extracted = await mammoth.extractRawText({ buffer });
      if (!extracted.value?.trim()) {
        return NextResponse.json(
          { error: 'DOCX text extraction failed. Please convert to PDF and retry.' },
          { status: 422 }
        );
      }
      docxText = extracted.value;
    }

    // LLM_PRIMARY defaults to 'sarvam' (Anthropic credits depleted — P0 Cost Control).
    // Override: set LLM_PRIMARY=claude in VPS env to force Claude-only mode.
    const llmPrimary  = process.env.LLM_PRIMARY ?? 'sarvam';
    const sarvamKey   = process.env.SARVAM_API_KEY;
    const useSarvam   = llmPrimary !== 'claude' && !!sarvamKey;

    let rawResponse = '';

    // ════════════════════════════════════════════════════════════════════════════
    // PRIMARY PATH: Sarvam (₹1.50/page for PDFs; free for DOCX text extraction)
    // ════════════════════════════════════════════════════════════════════════════
    if (useSarvam) {
      try {
        let extractedText: string;
        let pageCount = 0;
        let chunkCount = 1;

        if (isPdf) {
          // PDF → Sarvam Document Intelligence OCR (async job, 10-page chunks)
          const t0 = Date.now();
          const ocr = await callSarvamVisionOCR(fileBase64, sarvamKey!);
          extractedText = ocr.ocrText;
          pageCount     = ocr.pageCount;
          chunkCount    = ocr.chunkCount;
          const costPaise = pageCount * 150; // ₹1.50 = 150 paise per page
          console.log(
            `[vision-read] provider=sarvam pages=${pageCount} chunks=${chunkCount} ` +
            `cost=₹${(costPaise / 100).toFixed(2)} elapsed=${Date.now() - t0}ms`
          );
        } else if (isDocx && docxText) {
          // DOCX already extracted by mammoth — skip OCR step
          extractedText = docxText;
          console.log('[vision-read] provider=sarvam source=mammoth docxChars=' + extractedText.length);
        } else {
          // Images (JPG/PNG) — Sarvam 105B is text-only; cannot do image OCR
          throw new Error('Sarvam: image files require Claude Vision — skipping to fallback');
        }

        // Sarvam 105B: text → structured JSON (same VISION_SYSTEM_PROMPT as Claude)
        rawResponse = await callSarvamTextToJson(extractedText, VISION_SYSTEM_PROMPT, sarvamKey!);
        console.log('[vision-read] Sarvam extraction complete, rawLen=' + rawResponse.length);

      } catch (sarvamErr) {
        const msg = sarvamErr instanceof Error ? sarvamErr.message : String(sarvamErr);
        console.warn('[vision-read] Sarvam primary failed — falling back to Claude:', msg);
        rawResponse = ''; // ensure fallback runs
      }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // FALLBACK PATH: Claude Vision
    // Runs when: Sarvam failed, LLM_PRIMARY=claude, no SARVAM_API_KEY, or image files
    // ════════════════════════════════════════════════════════════════════════════
    if (!rawResponse) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('[vision-read] No ANTHROPIC_API_KEY — both Sarvam and Claude unavailable');
        return NextResponse.json(
          { error: 'ಸರ್ವರ್ ಕಾನ್ಫಿಗರೇಶನ್ ದೋಷ / Server configuration error' },
          { status: 500 }
        );
      }

      const client       = new Anthropic({ apiKey });
      const imageContent = isDocx ? [] : buildImageContent(fileBase64, mimeType);
      let lastError: unknown;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

        try {
          const label = useSarvam ? 'claude-fallback' : 'claude';
          console.log(`[vision-read] provider=${label} attempt=${attempt + 1}`);

          const response = await client.messages.create(
            {
              model: VISION_MODEL,
              max_tokens: 4096,
              system: VISION_SYSTEM_PROMPT,
              messages: [
                {
                  role: 'user',
                  content: docxText
                    ? [
                        { type: 'text' as const, text: `Case file document text:\n\n${docxText}` },
                        { type: 'text' as const, text: 'Please analyze this case file and return the structured JSON as specified.' },
                      ]
                    : [
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ...(imageContent as any[]),
                        { type: 'text' as const, text: 'Please analyze this case file and return the structured JSON as specified.' },
                      ],
                },
              ],
            },
            isPdf ? { headers: { 'anthropic-beta': 'pdfs-2024-09-25' } } : undefined
          );

          rawResponse = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as { type: 'text'; text: string }).text)
            .join('');

          clearTimeout(timeout);
          break; // success — exit retry loop

        } catch (err) {
          clearTimeout(timeout);
          lastError = err;
          if (isRateLimitError(err)) throw err; // never retry rate limits
          if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
        }
      }

      if (!rawResponse) {
        throw lastError ?? new Error('Vision API returned empty response');
      }
    }

    // ── Parse and validate response ──────────────────────────────────────────────
    const parsed = parseCaseSummary(rawResponse);
    const result: VisionReadResponse = {
      caseSummary: {
        caseType:     parsed.caseType,
        parties:      parsed.parties,
        keyFacts:     parsed.keyFacts,
        reliefSought: parsed.reliefSought,
        ...(parsed.extras ? { extras: parsed.extras } : {}),
      },
      questions: parsed.questions,
      caseType:  parsed.caseType,
    };

    return NextResponse.json(result);

  } catch (err) {
    console.error('Vision read error:', err);
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'AI ಸೇವೆ ನಿಧಾನವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / AI service timed out. Please retry.'
      : 'ಫೈಲ್ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Could not read file. Please retry.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type AnthropicImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

type ImageBlock = {
  type: 'image';
  source: { type: 'base64'; media_type: AnthropicImageMediaType; data: string };
};

type DocumentBlock = {
  type: 'document';
  source: { type: 'base64'; media_type: 'application/pdf'; data: string };
};

function buildImageContent(
  fileBase64: string,
  mimeType: string
): Array<ImageBlock | DocumentBlock> {
  if (mimeType === 'application/pdf') {
    return [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } }];
  }
  if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
    return [{ type: 'image', source: { type: 'base64', media_type: mimeType as AnthropicImageMediaType, data: fileBase64 } }];
  }
  return [];
}

interface ParsedVisionResponse {
  caseType:    string;
  parties:     CaseSummary['parties'];
  keyFacts:    string[];
  reliefSought: string;
  extras?:     CaseSummary['extras'];
  questions:   string[];
}

/**
 * Parse and validate JSON response from any vision provider.
 * Property 5: Case summary always contains all required fields.
 * Property 6: Vision_Reader always returns 4 to 5 questions.
 */
function parseCaseSummary(rawResponse: string): ParsedVisionResponse {
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Vision response');

  let parsed: Partial<ParsedVisionResponse>;
  try { parsed = JSON.parse(jsonMatch[0]); }
  catch { throw new Error('Invalid JSON in Vision response'); }

  if (!parsed.caseType || typeof parsed.caseType !== 'string' || !parsed.caseType.trim()) {
    throw new Error('Missing or empty caseType in Vision response');
  }
  if (!parsed.parties?.petitioner || !parsed.parties?.respondent) {
    throw new Error('Missing parties in Vision response');
  }
  if (!Array.isArray(parsed.keyFacts) || parsed.keyFacts.length === 0) {
    throw new Error('Missing or empty keyFacts in Vision response');
  }
  if (!parsed.reliefSought || typeof parsed.reliefSought !== 'string' || !parsed.reliefSought.trim()) {
    throw new Error('Missing or empty reliefSought in Vision response');
  }
  if (!Array.isArray(parsed.questions) || parsed.questions.length < 4 || parsed.questions.length > 5) {
    throw new Error(`questions array must have 4-5 items, got ${parsed.questions?.length ?? 0}`);
  }

  // V3.2.7 FIX 4 — sanitize optional extras (all fields optional; nulls/missing drop out)
  const rawExtras = (parsed as { extras?: Record<string, unknown> }).extras;
  let extras: CaseSummary['extras'] | undefined;
  if (rawExtras && typeof rawExtras === 'object') {
    const cleanStr = (v: unknown): string | undefined =>
      typeof v === 'string' && v.trim() && v.trim().toLowerCase() !== 'null' ? v.trim() : undefined;
    const cleanDates = (v: unknown): string[] | undefined => {
      if (!Array.isArray(v)) return undefined;
      const out = v.filter((d): d is string => typeof d === 'string' && d.trim().length > 0).map(d => d.trim());
      return out.length > 0 ? out : undefined;
    };
    const candidate: CaseSummary['extras'] = {
      appellantAge:          cleanStr(rawExtras.appellantAge),
      respondent3Age:        cleanStr(rawExtras.respondent3Age),
      hearingDates:          cleanDates(rawExtras.hearingDates),
      mutationNo:            cleanStr(rawExtras.mutationNo),
      mutationDate:          cleanStr(rawExtras.mutationDate),
      saleDeedConsideration: cleanStr(rawExtras.saleDeedConsideration),
    };
    // Drop keys with undefined values so JSON stays lean
    const entries = Object.entries(candidate).filter(([, v]) => v !== undefined);
    extras = entries.length > 0 ? Object.fromEntries(entries) as CaseSummary['extras'] : undefined;
  }

  return { ...(parsed as ParsedVisionResponse), extras };
}
