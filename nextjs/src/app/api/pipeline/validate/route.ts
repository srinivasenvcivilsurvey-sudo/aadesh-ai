/**
 * POST /api/pipeline/validate
 * Validates an uploaded file before processing.
 *
 * Properties validated:
 *   1: Valid file types are accepted, invalid types are rejected
 *   2: Files exceeding 200 pages are rejected
 *
 * v9.2 security additions:
 *   - Bearer token auth via Supabase (Fix 1)
 *   - 50 MB file size limit on base64 input (Fix 10)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import type { ValidateResponse, AllowedFileType } from '@/lib/pipeline/types';

const MAX_PAGES = 200;
const TIMEOUT_MS = 30_000;
const MAX_BASE64_SIZE = 67_000_000; // ~50 MB file

const ALLOWED_MIME_TYPES: Record<string, AllowedFileType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const BILINGUAL_ERRORS = {
  unauthorized: 'ಅನಧಿಕೃತ / Unauthorized',
  invalidType: 'ಈ ಫೈಲ್ ಪ್ರಕಾರ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ / File type not supported. Use PDF, DOCX, JPG, or PNG.',
  tooManyPages: `ಫೈಲ್ ${MAX_PAGES} ಪುಟಗಳಿಗಿಂತ ಹೆಚ್ಚಿದೆ / File exceeds ${MAX_PAGES} pages.`,
  tooLarge: 'ಫೈಲ್ 50MB ಗಿಂತ ದೊಡ್ಡದಾಗಿದೆ / File exceeds 50MB limit',
  timeout: 'ಫೈಲ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ / Validation timed out. Please try again.',
  parseError: 'ಫೈಲ್ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ / Could not read file. Please check the file and try again.',
};

export async function POST(request: NextRequest): Promise<NextResponse<ValidateResponse>> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.unauthorized },
      { status: 401 }
    );
  }
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json(
      { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.unauthorized },
      { status: 401 }
    );
  }

  const validationPromise = runValidation(request);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
  );

  try {
    const result = await Promise.race([validationPromise, timeoutPromise]);
    return NextResponse.json(result);
  } catch (err) {
    const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
    console.error('[validate] Error:', isTimeout ? 'TIMEOUT' : err);
    return NextResponse.json(
      { valid: false, pageCount: 0, fileType: 'pdf', error: isTimeout ? BILINGUAL_ERRORS.timeout : BILINGUAL_ERRORS.parseError },
      { status: isTimeout ? 408 : 422 }
    );
  }
}

async function runValidation(request: NextRequest): Promise<ValidateResponse> {
  const body = await request.json();
  const { fileBase64, mimeType } = body as { fileBase64: string; mimeType: string };

  // ── File size limit (Fix 10) ──────────────────────────────────────────────
  if (fileBase64.length > MAX_BASE64_SIZE) {
    return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.tooLarge };
  }

  // ── Check MIME type ───────────────────────────────────────────────────────
  const fileType = ALLOWED_MIME_TYPES[mimeType];
  if (!fileType) {
    return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.invalidType };
  }

  // ── Images: always 1 page ─────────────────────────────────────────────────
  if (fileType === 'jpg' || fileType === 'png') {
    return { valid: true, pageCount: 1, fileType };
  }

  // ── Decode base64 ─────────────────────────────────────────────────────────
  const buffer = Buffer.from(fileBase64, 'base64');

  // ── PDF: count pages with pdf-lib ─────────────────────────────────────────
  if (fileType === 'pdf') {
    let pageCount = 1;
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();
    } catch (pdfErr) {
      console.warn('[validate] pdf-lib could not parse PDF — using pageCount=1 fallback:', pdfErr);
      // PDF is still valid — vision-read will handle it directly
      return { valid: true, pageCount: 1, fileType };
    }

    if (pageCount > MAX_PAGES) {
      return { valid: false, pageCount, fileType, error: BILINGUAL_ERRORS.tooManyPages };
    }
    return { valid: true, pageCount, fileType };
  }

  // ── DOCX: extract text and estimate pages ─────────────────────────────────
  if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    // Estimate pages: ~500 words per page, ~5 chars per word
    const estimatedPages = Math.ceil(result.value.length / 2500);

    if (estimatedPages > MAX_PAGES) {
      return { valid: false, pageCount: estimatedPages, fileType, error: BILINGUAL_ERRORS.tooManyPages };
    }
    return { valid: true, pageCount: estimatedPages, fileType };
  }

  return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.invalidType };
}
