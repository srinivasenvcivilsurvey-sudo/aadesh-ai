/**
 * GET /api/pipeline/assistance-report?orderId=<id>
 * Generates the RAI Assistance Report PDF from stored order/audit values only.
 * No AI provider calls are made in this route.
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  assistanceReportHash,
  buildAssistanceReportData,
  buildReportMetadataPatch,
  buildReportStoragePath,
  renderAssistanceReportPdf,
  validateAssistanceReportAccess,
  type AssistanceReportAuditEvent,
  type AssistanceReportOrder,
} from '@/lib/pipeline/assistanceReport';
import { logException } from '@/lib/pipeline/errorLogger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const orderId = request.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  try {
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select([
        'id',
        'user_id',
        'state',
        'case_number',
        'case_type',
        'created_at',
        'updated_at',
        'upload_sha256',
        'input_pdf_sha256',
        'attestation_hash',
        'reasoning_hash',
        'manifest_seed_hash',
        'output_hash',
        'final_manifest_hash',
        'manifest_hash',
        'model_used',
        'prompt_version',
        'input_tokens',
        'output_tokens',
        'locked_name',
        'locked_at',
        'attestation_nonce_consumed',
        'confirmed_fields',
        'conflict_reasons',
        'key_issue',
        'documents_relied',
        'reasoning_text',
        'gen_finished_at',
      ].join(', '))
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: 'Order lookup failed' }, { status: 500 });
    }

    const orderRow = order as unknown as AssistanceReportOrder;
    const access = validateAssistanceReportAccess(
      { id: user.id, email: user.email },
      orderRow
    );
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }

    const { data: auditRows } = await adminClient
      .from('audit_log')
      .select('event_type, event_payload, event_hash, created_at')
      .eq('receipt_id', orderId)
      .order('created_at', { ascending: true });

    const reportData = buildAssistanceReportData(
      orderRow,
      (auditRows ?? []) as AssistanceReportAuditEvent[],
      { id: user.id, email: user.email }
    );
    const pdfBytes = await renderAssistanceReportPdf(reportData);
    const reportHash = assistanceReportHash(pdfBytes);
    const reportPath = buildReportStoragePath(user.id, orderId);
    let storedPath: string | null = reportPath;

    const { error: uploadError } = await adminClient.storage
      .from('files')
      .upload(reportPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[assistance-report] storage upload failed:', uploadError.message);
      storedPath = null;
    }

    const generatedAt = new Date().toISOString();
    const { error: updateError } = await adminClient
      .from('orders')
      .update(buildReportMetadataPatch(reportHash, storedPath, generatedAt))
      .eq('id', orderId)
      .eq('user_id', user.id)
      .eq('state', 'generated');

    if (updateError) {
      console.error('[assistance-report] metadata update failed:', updateError.message);
      return NextResponse.json({ error: 'Failed to store report metadata' }, { status: 500 });
    }

    const fileName = `aadesh_assistance_report_${orderId}.pdf`;
    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Assistance-Report-Hash': reportHash,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    await logException(err, { route: '/api/pipeline/assistance-report', userId: user.id, metadata: { orderId } });
    return NextResponse.json({ error: 'Assistance Report generation failed' }, { status: 500 });
  }
}
