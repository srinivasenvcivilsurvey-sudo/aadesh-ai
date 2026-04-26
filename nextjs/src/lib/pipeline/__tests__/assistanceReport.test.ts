import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  assistanceReportHash,
  buildAssistanceReportData,
  buildReportMetadataPatch,
  renderAssistanceReportPdf,
  validateAssistanceReportAccess,
  type AssistanceReportOrder,
} from '../assistanceReport';

const generatedOrder: AssistanceReportOrder = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: 'user-1',
  state: 'generated',
  case_number: '12/2026',
  case_type: 'contested_appeal',
  created_at: '2026-04-26T10:00:00.000Z',
  updated_at: '2026-04-26T10:05:00.000Z',
  upload_sha256: 'a'.repeat(64),
  attestation_hash: 'b'.repeat(64),
  reasoning_hash: 'c'.repeat(64),
  manifest_seed_hash: 'd'.repeat(64),
  output_hash: 'e'.repeat(64),
  final_manifest_hash: 'f'.repeat(64),
  model_used: 'claude-sonnet-4-6',
  prompt_version: 'V3.2.7',
  input_tokens: 100,
  output_tokens: 200,
  locked_name: 'Officer Name',
  locked_at: '2026-04-26T10:02:00.000Z',
  attestation_nonce_consumed: true,
  confirmed_fields: {
    petitioner: 'Petitioner A',
    respondent: 'Respondent B',
    keyFact_0: 'Survey 12/3 in Example Village',
    keyFact_1: 'Case date 26-04-2026',
  },
  key_issue: 'Whether Survey 12/3 record should be corrected.',
  documents_relied: ['RTC', 'Survey Sketch'],
  reasoning_text: 'Officer reviewed Survey 12/3 and confirmed the correction is supported by the record.',
  gen_finished_at: '2026-04-26T10:04:00.000Z',
};

describe('Assistance Report access control', () => {
  it('unauthenticated request is rejected', () => {
    const result = validateAssistanceReportAccess(null, generatedOrder);
    expect(result).toEqual({ ok: false, status: 401, message: 'Unauthorized' });
  });

  it('wrong user is rejected', () => {
    const result = validateAssistanceReportAccess({ id: 'user-2' }, generatedOrder);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it('non-generated order is rejected', () => {
    const result = validateAssistanceReportAccess({ id: 'user-1' }, { ...generatedOrder, state: 'reasoned' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(409);
  });

  it('generated order is allowed', () => {
    expect(validateAssistanceReportAccess({ id: 'user-1' }, generatedOrder)).toEqual({ ok: true });
  });
});

describe('Assistance Report rendering and metadata', () => {
  it('generated order returns a PDF report', async () => {
    const data = buildAssistanceReportData(generatedOrder, [], { id: 'user-1', email: 'officer@example.com' });
    const pdf = await renderAssistanceReportPdf(data);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it('report data includes final_manifest_hash', () => {
    const data = buildAssistanceReportData(generatedOrder, [], { id: 'user-1' });
    expect(data.finalManifestHash).toBe('f'.repeat(64));
    expect(data.integrity.finalManifestHash).toBe('f'.repeat(64));
  });

  it('report hash is stored in metadata patch', async () => {
    const data = buildAssistanceReportData(generatedOrder, [], { id: 'user-1' });
    const pdf = await renderAssistanceReportPdf(data);
    const hash = assistanceReportHash(pdf);
    const patch = buildReportMetadataPatch(hash, 'assistance-reports/user-1/order.pdf', '2026-04-26T10:10:00.000Z');
    expect(patch.assistance_report_hash).toBe(hash);
    expect(patch.assistance_report_generated_at).toBe('2026-04-26T10:10:00.000Z');
    expect(patch.assistance_report_path).toBe('assistance-reports/user-1/order.pdf');
  });

  it('does not import or call LLM providers', () => {
    const helperSource = readFileSync(path.join(process.cwd(), 'src/lib/pipeline/assistanceReport.ts'), 'utf8');
    const routeSource = readFileSync(path.join(process.cwd(), 'src/app/api/pipeline/assistance-report/route.ts'), 'utf8');
    const combined = helperSource + routeSource;
    expect(combined).not.toMatch(/Anthropic|Sarvam|OpenAI|generateWithClaude|sarvamGenerate|callAnthropic/i);
  });
});
