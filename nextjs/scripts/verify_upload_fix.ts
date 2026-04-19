/**
 * scripts/verify_upload_fix.ts
 *
 * Verifies the v10 upload fix end-to-end:
 *   1. POSTs a real CamScanner-size PDF to /api/pipeline/validate as multipart
 *   2. Asserts HTTP 200 + { valid: true, storagePath, pageCount }
 *   3. Asserts storagePath shape matches `<userId>/<epochMs>_<safeName>`
 *
 * Usage:
 *   BASE_URL=https://aadesh-ai.in \
 *   SUPABASE_BEARER=<jwt> \
 *   TEST_PDF=/path/to/Machohalli_163.pdf \
 *   npx tsx scripts/verify_upload_fix.ts
 *
 * Env:
 *   BASE_URL         base origin (default http://localhost:3000)
 *   SUPABASE_BEARER  required — Supabase user access token
 *   TEST_PDF         path to a PDF fixture (default: ./Machohalli_163.pdf)
 *   EXPECTED_PAGES   optional assertion on pageCount (default: 29)
 */

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

interface ValidateResponse {
  valid: boolean;
  pageCount: number;
  fileType: 'pdf' | 'docx' | 'jpg' | 'png';
  storagePath?: string;
  sizeBytes?: number;
  error?: string;
}

async function main(): Promise<void> {
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  const bearer = process.env.SUPABASE_BEARER;
  const pdfPath = process.env.TEST_PDF ?? './Machohalli_163.pdf';
  const expectedPages = Number(process.env.EXPECTED_PAGES ?? 29);

  if (!bearer) {
    console.error('FAIL: SUPABASE_BEARER env var required');
    process.exit(1);
  }

  const bytes = await readFile(pdfPath);
  const sizeMB = (bytes.length / (1024 * 1024)).toFixed(2);
  console.log(`[verify] fixture: ${pdfPath} (${sizeMB} MB, ${bytes.length} bytes)`);

  // Copy into a fresh ArrayBuffer so Blob accepts it (Buffer.buffer may be SharedArrayBuffer)
  const ab = new ArrayBuffer(bytes.length);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, basename(pdfPath));

  const url = `${baseUrl}/api/pipeline/validate`;
  console.log(`[verify] POST ${url}`);
  const started = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${bearer}` },
    body: formData,
  });
  const elapsed = Date.now() - started;

  const body = (await response.json().catch(() => ({}))) as ValidateResponse;

  console.log(`[verify] status: ${response.status} (${elapsed}ms)`);
  console.log(`[verify] body: ${JSON.stringify(body, null, 2)}`);

  const failures: string[] = [];
  if (response.status !== 200) failures.push(`status ${response.status} !== 200`);
  if (!body.valid) failures.push(`valid=${body.valid}`);
  if (!body.storagePath) failures.push('storagePath missing');
  if (body.pageCount !== expectedPages) {
    failures.push(`pageCount=${body.pageCount} !== expected ${expectedPages}`);
  }
  if (body.storagePath && !/^[\w-]+\/\d+_.+$/.test(body.storagePath)) {
    failures.push(`storagePath shape bad: ${body.storagePath}`);
  }

  if (failures.length > 0) {
    console.error('FAIL:\n  - ' + failures.join('\n  - '));
    process.exit(1);
  }

  console.log('PASS: multipart upload → Supabase Storage path → page count all OK');
}

main().catch((err: unknown) => {
  console.error('FAIL: unhandled error:', err);
  process.exit(1);
});
