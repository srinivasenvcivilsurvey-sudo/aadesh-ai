/**
 * POST /api/pipeline/validate
 * Validates an uploaded file before processing.
 *
 * v10 architectural fix (2026-04-19):
 *   - Accepts multipart/form-data (FormData) with fields { file, caseTypeHint }
 *   - Uploads PDF/DOCX/image to Supabase Storage 'files' bucket
 *   - Returns { valid, storagePath, pageCount, fileType }
 *   - Client no longer stores base64 in sessionStorage (QuotaExceededError fix)
 *   - Legacy JSON { fileBase64, mimeType } path kept for backward compatibility
 *
 * Properties validated:
 *   1: Valid file types are accepted, invalid types are rejected
 *   2: Files exceeding 200 pages are rejected
 *
 * v9.2 security:
 *   - Bearer token auth via Supabase (Fix 1)
 *   - 50 MB file size limit (Fix 10)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import { createHash, randomUUID } from 'crypto';
import type { ValidateResponse, AllowedFileType } from '@/lib/pipeline/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_PAGES = 200;
const TIMEOUT_MS = 45_000;
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_BASE64_SIZE = 67_000_000;      // ~50 MB as base64

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
  storageError: 'ಫೈಲ್ ಸಂಗ್ರಹ ವಿಫಲವಾಗಿದೆ / File storage upload failed.',
  noFile: 'ಫೈಲ್ ಒದಗಿಸಲಾಗಿಲ್ಲ / No file provided',
};

interface ValidateResponseWithPath extends ValidateResponse {
  storagePath?: string;
  sizeBytes?: number;
  // L1 Legal Shield — returned only on successful multipart upload
  receiptId?: string;
  sha256?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ValidateResponseWithPath>> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.unauthorized },
      { status: 401 }
    );
  }
  const token = authHeader.split(' ')[1];
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json(
      { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.unauthorized },
      { status: 401 }
    );
  }

  const validationPromise = runValidation(request, user.id);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
  );

  try {
    const result = await Promise.race([validationPromise, timeoutPromise]);
    const status = result.valid ? 200 : 422;
    return NextResponse.json(result, { status });
  } catch (err) {
    const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
    console.error('[validate] Error:', isTimeout ? 'TIMEOUT' : err);
    return NextResponse.json(
      { valid: false, pageCount: 0, fileType: 'pdf', error: isTimeout ? BILINGUAL_ERRORS.timeout : BILINGUAL_ERRORS.parseError },
      { status: isTimeout ? 408 : 422 }
    );
  }
}

async function runValidation(request: NextRequest, userId: string): Promise<ValidateResponseWithPath> {
  const contentType = request.headers.get('content-type') || '';

  let fileBuffer: Buffer;
  let mimeType: string;
  let originalName: string;
  let isMultipart = false;

  if (contentType.includes('multipart/form-data')) {
    isMultipart = true;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.noFile };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.tooLarge };
    }
    fileBuffer = Buffer.from(await file.arrayBuffer());
    mimeType = file.type;
    originalName = file.name || 'upload.pdf';
    console.log('[validate] multipart received:', {
      name: originalName,
      mime: mimeType,
      sizeMB: (fileBuffer.length / (1024 * 1024)).toFixed(2),
    });
  } else {
    // Legacy JSON path — base64 body (deprecated, kept for rollback safety)
    const body = await request.json();
    const { fileBase64, mimeType: bodyMime, fileName } = body as {
      fileBase64: string;
      mimeType: string;
      fileName?: string;
    };
    if (!fileBase64 || fileBase64.length > MAX_BASE64_SIZE) {
      return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.tooLarge };
    }
    fileBuffer = Buffer.from(fileBase64, 'base64');
    mimeType = bodyMime;
    originalName = fileName || 'upload.pdf';
    console.log('[validate] legacy JSON received:', {
      name: originalName,
      mime: mimeType,
      sizeMB: (fileBuffer.length / (1024 * 1024)).toFixed(2),
    });
  }

  // ── Check MIME type ───────────────────────────────────────────────────────
  const fileType = ALLOWED_MIME_TYPES[mimeType];
  if (!fileType) {
    return { valid: false, pageCount: 0, fileType: 'pdf', error: BILINGUAL_ERRORS.invalidType };
  }

  // ── Page count validation ─────────────────────────────────────────────────
  let pageCount = 1;

  if (fileType === 'pdf') {
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();
    } catch (pdfErr) {
      console.warn('[validate] pdf-lib could not parse PDF — using pageCount=1 fallback:', pdfErr);
      pageCount = 1;
    }
    if (pageCount > MAX_PAGES) {
      return { valid: false, pageCount, fileType, error: BILINGUAL_ERRORS.tooManyPages };
    }
  } else if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    pageCount = Math.max(1, Math.ceil(result.value.length / 2500));
    if (pageCount > MAX_PAGES) {
      return { valid: false, pageCount, fileType, error: BILINGUAL_ERRORS.tooManyPages };
    }
  } else {
    // images: always 1 page
    pageCount = 1;
  }

  // ── Upload to Supabase Storage (only multipart path) ─────────────────────
  // Legacy base64 path: skip upload, return valid without storagePath — the
  // old flow still sends base64 directly to vision-read.
  if (!isMultipart) {
    return { valid: true, pageCount, fileType };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('[validate] SUPABASE_SERVICE_ROLE_KEY not set — cannot upload to storage');
    return { valid: false, pageCount, fileType, error: BILINGUAL_ERRORS.storageError };
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  const safeName = originalName
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  const storagePath = `${userId}/${Date.now()}_${safeName}`;

  const uploadOne = async () =>
    adminClient.storage.from('files').upload(storagePath, fileBuffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false,
    });

  let { error: uploadError } = await uploadOne();

  // Auto-create bucket on first use, then retry
  if (uploadError && (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket'))) {
    console.warn('[validate] files bucket missing — creating');
    await adminClient.storage.createBucket('files', {
      public: false,
      fileSizeLimit: MAX_FILE_BYTES,
    });
    const retry = await uploadOne();
    uploadError = retry.error;
  }

  if (uploadError) {
    console.error('[validate] Supabase upload failed:', uploadError);
    return { valid: false, pageCount, fileType, error: BILINGUAL_ERRORS.storageError };
  }

  console.log('[validate] uploaded to storage:', storagePath);

  // ── L1 Legal Shield: SHA-256 + audit_log receipt ──────────────────────────
  const sha256 = createHash('sha256').update(fileBuffer).digest('hex');
  const receiptId = randomUUID();
  const uploadTimestamp = new Date().toISOString();

  const eventPayload = {
    file_name: safeName,
    file_size_bytes: fileBuffer.length,
    page_count: pageCount,
    mime_type: mimeType,
    storage_path: storagePath,
    upload_timestamp: uploadTimestamp,
    input_pdf_sha256: sha256,
  };
  const eventHash = createHash('sha256')
    .update(JSON.stringify(eventPayload, Object.keys(eventPayload).sort()))
    .digest('hex');

  try {
    await adminClient.from('audit_log').insert({
      id: receiptId,
      user_id: userId,
      receipt_id: receiptId,
      event_type: 'upload',
      event_payload: eventPayload,
      event_hash: eventHash,
    });
  } catch (auditErr) {
    // Non-blocking: log but don't fail the upload
    console.warn('[validate] audit_log insert failed (non-fatal):', auditErr);
  }

  return {
    valid: true,
    pageCount,
    fileType,
    storagePath,
    sizeBytes: fileBuffer.length,
    receiptId,
    sha256,
  };
}
