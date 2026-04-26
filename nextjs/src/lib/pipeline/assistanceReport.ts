import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { sha256Hex } from './legalState';

export const ASSISTANCE_REPORT_RESPONSIBILITY_EN =
  'This document was prepared with assistance from Aadesh AI, an AI-based drafting assistant. The AI system did not make an autonomous legal decision. The responsible officer/user verified the extracted facts, provided or confirmed reasoning, reviewed the generated draft, and remains solely responsible for the final contents and use of the order.';

export const ASSISTANCE_REPORT_RESPONSIBILITY_KN =
  '[Kannada responsibility statement to be reviewed by legal/Kannada reviewer]';

const FOOTER_TEXT = 'AI-assisted draft — verified, reasoned, and finalized by responsible officer/user.';
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 48;
const TOP_Y = 790;
const BOTTOM_Y = 58;

export interface AssistanceReportOrder {
  id: string;
  user_id: string;
  state: string;
  case_number?: string | null;
  case_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  upload_sha256?: string | null;
  input_pdf_sha256?: string | null;
  attestation_hash?: string | null;
  reasoning_hash?: string | null;
  manifest_seed_hash?: string | null;
  output_hash?: string | null;
  final_manifest_hash?: string | null;
  manifest_hash?: string | null;
  model_used?: string | null;
  prompt_version?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  locked_name?: string | null;
  locked_at?: string | null;
  attestation_nonce_consumed?: boolean | null;
  confirmed_fields?: Record<string, unknown> | null;
  conflict_reasons?: Record<string, unknown> | null;
  key_issue?: string | null;
  documents_relied?: unknown;
  reasoning_text?: string | null;
  gen_finished_at?: string | null;
}

export interface AssistanceReportAuditEvent {
  event_type?: string | null;
  event_payload?: Record<string, unknown> | null;
  event_hash?: string | null;
  created_at?: string | null;
}

export interface AssistanceReportUser {
  id: string;
  email?: string | null;
}

export interface AssistanceReportData {
  orderId: string;
  caseNumber: string;
  officerName: string;
  generatedAt: string;
  finalManifestHash: string;
  source: {
    originalFilename: string;
    pageCount: string;
    uploadSha256: string;
    ocrProvider: string;
  };
  extracted: {
    partyNames: string;
    surveyNumbers: string;
    villageTalukDistrict: string;
    caseNumberDate: string;
    keyFacts: string[];
    confidence: string;
  };
  entityLock: {
    confirmedFields: Record<string, string>;
    lockedName: string;
    lockedAt: string;
    attestationHash: string;
    nonceConsumed: string;
  };
  reasoning: {
    keyIssue: string;
    documentsReliedUpon: string;
    decisionReasoning: string;
    reasoningHash: string;
  };
  integrity: {
    manifestSeedHash: string;
    outputHash: string;
    finalManifestHash: string;
    promptVersion: string;
    model: string;
    tokenCounts: string;
  };
}

export type AssistanceAccessResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export function validateAssistanceReportAccess(
  user: AssistanceReportUser | null,
  order: Pick<AssistanceReportOrder, 'user_id' | 'state'> | null
): AssistanceAccessResult {
  if (!user) return { ok: false, status: 401, message: 'Unauthorized' };
  if (!order) return { ok: false, status: 404, message: 'Order not found' };
  if (order.user_id !== user.id) return { ok: false, status: 403, message: 'Forbidden' };
  if (order.state !== 'generated') {
    return { ok: false, status: 409, message: `Assistance Report requires state=generated, got ${order.state}` };
  }
  return { ok: true };
}

export function buildAssistanceReportData(
  order: AssistanceReportOrder,
  auditEvents: AssistanceReportAuditEvent[],
  user: AssistanceReportUser
): AssistanceReportData {
  const uploadEvent = auditEvents.find((e) => e.event_type === 'upload');
  const uploadPayload = uploadEvent?.event_payload ?? {};
  const confirmed = normalizeRecord(order.confirmed_fields);
  const keyFacts = Object.entries(confirmed)
    .filter(([key]) => key.startsWith('keyFact_'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value)
    .filter(Boolean);

  const allFieldText = Object.values(confirmed).join(' ');
  const surveyNumbers = uniqueMatches(allFieldText, /\b\d+(?:\/\d+){1,3}\b/g).join(', ') || 'Not recorded';
  const caseDates = uniqueMatches(allFieldText, /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g).join(', ') || 'Not recorded';
  const caseNumbers = uniqueMatches(allFieldText, /\b\d+\/\d{2,4}(?:-\d{2})?\b/g).join(', ') || order.case_number || 'Not recorded';

  return {
    orderId: order.id,
    caseNumber: order.case_number || caseNumbers || 'Not recorded',
    officerName: order.locked_name || user.email || user.id,
    generatedAt: order.gen_finished_at || order.updated_at || order.created_at || new Date().toISOString(),
    finalManifestHash: order.final_manifest_hash || order.manifest_hash || 'MISSING',
    source: {
      originalFilename: stringValue(uploadPayload.file_name, 'Not recorded'),
      pageCount: stringValue(uploadPayload.page_count, 'Not recorded'),
      uploadSha256: order.upload_sha256 || order.input_pdf_sha256 || stringValue(uploadPayload.input_pdf_sha256, 'MISSING'),
      ocrProvider: stringValue(uploadPayload.ocr_provider, 'Not recorded'),
    },
    extracted: {
      partyNames: [
        confirmed.petitioner ? `Petitioner/Appellant: ${confirmed.petitioner}` : '',
        confirmed.respondent ? `Respondent: ${confirmed.respondent}` : '',
      ].filter(Boolean).join(' | ') || 'Not recorded',
      surveyNumbers,
      villageTalukDistrict: extractLocation(allFieldText),
      caseNumberDate: `Case: ${caseNumbers}; Dates: ${caseDates}`,
      keyFacts: keyFacts.length ? keyFacts : ['Not recorded'],
      confidence: 'Not recorded',
    },
    entityLock: {
      confirmedFields: confirmed,
      lockedName: order.locked_name || 'Not recorded',
      lockedAt: order.locked_at || 'Not recorded',
      attestationHash: order.attestation_hash || 'MISSING',
      nonceConsumed: order.attestation_nonce_consumed ? 'true' : 'false',
    },
    reasoning: {
      keyIssue: order.key_issue || 'Not recorded',
      documentsReliedUpon: documentsToString(order.documents_relied),
      decisionReasoning: order.reasoning_text || 'Not recorded',
      reasoningHash: order.reasoning_hash || 'MISSING',
    },
    integrity: {
      manifestSeedHash: order.manifest_seed_hash || 'MISSING',
      outputHash: order.output_hash || 'MISSING',
      finalManifestHash: order.final_manifest_hash || order.manifest_hash || 'MISSING',
      promptVersion: order.prompt_version || 'Not recorded',
      model: order.model_used || 'Not recorded',
      tokenCounts: `input=${order.input_tokens ?? 'not recorded'}, output=${order.output_tokens ?? 'not recorded'}`,
    },
  };
}

export async function renderAssistanceReportPdf(data: AssistanceReportData): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ctx: RenderContext = { pdf, page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: TOP_Y, regular, bold, pageNumber: 1 };

  title(ctx, 'Aadesh AI Assistance Report');
  line(ctx, `Order / Case: ${data.caseNumber}`);
  line(ctx, `Order ID: ${data.orderId}`);
  line(ctx, `Officer/User: ${data.officerName}`);
  line(ctx, `Generated at: ${data.generatedAt}`);
  line(ctx, `Final manifest hash: ${data.finalManifestHash}`);

  section(ctx, 'Section A — Source Material');
  kv(ctx, 'Original filename', data.source.originalFilename);
  kv(ctx, 'Page count', data.source.pageCount);
  kv(ctx, 'Input/upload SHA-256', data.source.uploadSha256);
  kv(ctx, 'OCR/vision provider', data.source.ocrProvider);

  section(ctx, 'Section B — AI Extracted Fields');
  kv(ctx, 'Party names', data.extracted.partyNames);
  kv(ctx, 'Survey numbers', data.extracted.surveyNumbers);
  kv(ctx, 'Village/Taluk/District', data.extracted.villageTalukDistrict);
  kv(ctx, 'Case number/date', data.extracted.caseNumberDate);
  kv(ctx, 'Confidence', data.extracted.confidence);
  list(ctx, 'Key extracted facts', data.extracted.keyFacts);

  section(ctx, 'Section C — Entity Lock Confirmation');
  Object.entries(data.entityLock.confirmedFields).forEach(([key, value]) => kv(ctx, key, value));
  kv(ctx, 'locked_name', data.entityLock.lockedName);
  kv(ctx, 'locked_at', data.entityLock.lockedAt);
  kv(ctx, 'attestation_hash', data.entityLock.attestationHash);
  kv(ctx, 'attestation_nonce_consumed', data.entityLock.nonceConsumed);

  section(ctx, 'Section D — Officer Reasoning');
  kv(ctx, 'Key issue', data.reasoning.keyIssue);
  kv(ctx, 'Documents relied upon', data.reasoning.documentsReliedUpon);
  kv(ctx, 'Decision reasoning', data.reasoning.decisionReasoning);
  kv(ctx, 'reasoning_hash', data.reasoning.reasoningHash);

  section(ctx, 'Section E — Integrity Manifest');
  kv(ctx, 'manifest_seed_hash', data.integrity.manifestSeedHash);
  kv(ctx, 'output_hash', data.integrity.outputHash);
  kv(ctx, 'final_manifest_hash', data.integrity.finalManifestHash);
  kv(ctx, 'prompt_version', data.integrity.promptVersion);
  kv(ctx, 'model', data.integrity.model);
  kv(ctx, 'token counts', data.integrity.tokenCounts);

  section(ctx, 'Section F — Responsibility Statement');
  paragraph(ctx, ASSISTANCE_REPORT_RESPONSIBILITY_EN);
  paragraph(ctx, ASSISTANCE_REPORT_RESPONSIBILITY_KN);

  footerAllPages(pdf, regular);
  return Buffer.from(await pdf.save());
}

export function assistanceReportHash(pdfBytes: Buffer): string {
  return sha256Hex(pdfBytes);
}

export function buildReportStoragePath(userId: string, orderId: string): string {
  return `assistance-reports/${userId}/${orderId}.pdf`;
}

export function buildReportMetadataPatch(hash: string, path: string | null, generatedAt: string) {
  return {
    assistance_report_generated_at: generatedAt,
    assistance_report_hash: hash,
    assistance_report_path: path,
  };
}

function normalizeRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, v]) => [key, stringValue(v, '')])
  );
}

function stringValue(value: unknown, fallback: string): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function documentsToString(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => stringValue(v, '')).filter(Boolean).join(', ') || 'Not recorded';
  return stringValue(value, 'Not recorded');
}

function uniqueMatches(text: string, pattern: RegExp): string[] {
  return [...new Set(text.match(pattern) ?? [])];
}

function extractLocation(text: string): string {
  const fragments = text
    .split(/[.;,\n]/)
    .filter((part) => /village|taluk|district|ಗ್ರಾಮ|ತಾಲ್ಲೂಕು|ಜಿಲ್ಲೆ/i.test(part))
    .map((part) => part.trim())
    .filter(Boolean);
  return fragments.slice(0, 3).join(' | ') || 'Not recorded';
}

interface RenderContext {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  pageNumber: number;
}

function title(ctx: RenderContext, text: string) {
  ensureSpace(ctx, 36);
  ctx.page.drawText(safePdfText(text), { x: MARGIN_X, y: ctx.y, size: 18, font: ctx.bold, color: rgb(0.07, 0.16, 0.31) });
  ctx.y -= 28;
}

function section(ctx: RenderContext, text: string) {
  ensureSpace(ctx, 40);
  ctx.y -= 10;
  ctx.page.drawText(safePdfText(text), { x: MARGIN_X, y: ctx.y, size: 13, font: ctx.bold, color: rgb(0.55, 0.18, 0.08) });
  ctx.y -= 20;
}

function kv(ctx: RenderContext, key: string, value: string) {
  paragraph(ctx, `${key}: ${value}`, 9.5);
}

function line(ctx: RenderContext, text: string) {
  paragraph(ctx, text, 10.5);
}

function list(ctx: RenderContext, label: string, items: string[]) {
  paragraph(ctx, `${label}:`, 9.5);
  items.forEach((item, index) => paragraph(ctx, `${index + 1}. ${item}`, 9.5, MARGIN_X + 12));
}

function paragraph(ctx: RenderContext, text: string, size = 9.5, x = MARGIN_X) {
  const maxChars = Math.max(40, Math.floor((PAGE_WIDTH - x - MARGIN_X) / (size * 0.55)));
  const lines = wrapText(safePdfText(text), maxChars);
  for (const wrapped of lines) {
    ensureSpace(ctx, 16);
    ctx.page.drawText(wrapped, { x, y: ctx.y, size, font: ctx.regular, color: rgb(0.11, 0.13, 0.17) });
    ctx.y -= size + 5;
  }
}

function ensureSpace(ctx: RenderContext, needed: number) {
  if (ctx.y - needed >= BOTTOM_Y) return;
  ctx.page = ctx.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.pageNumber += 1;
  ctx.y = TOP_Y;
}

function footerAllPages(pdf: PDFDocument, font: PDFFont) {
  const pages = pdf.getPages();
  pages.forEach((page, index) => {
    page.drawText(FOOTER_TEXT, { x: MARGIN_X, y: 30, size: 8, font, color: rgb(0.35, 0.35, 0.35) });
    page.drawText(`Page ${index + 1} of ${pages.length}`, { x: PAGE_WIDTH - 100, y: 30, size: 8, font, color: rgb(0.35, 0.35, 0.35) });
  });
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function safePdfText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[^\x20-\x7E\u2013\u2014]/g, '?')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000);
}
