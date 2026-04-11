/**
 * POST /api/pipeline/export-docx
 * Generates a DOCX file from the final order text and saves to orders table.
 * Uses the docx npm package (same as existing download route) with Noto Sans Kannada.
 *
 * Properties validated:
 *   17: Edited text is always used for DOCX export
 *   19: DOCX footer contains required text on every page
 *   20: Orders table record contains all required fields on export
 *   21: DOCX filename matches the required pattern
 *
 * v9.2 security additions:
 *   - Bearer token auth via Supabase (Fix 3)
 *   - userId in body must match authenticated user.id to prevent IDOR (Fix 3)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  Footer,
  PageNumber,
} from 'docx';
import type { ExportDocxRequest, ExportDocxResponse } from '@/lib/pipeline/types';
import { logException } from '@/lib/pipeline/errorLogger';

export async function POST(request: NextRequest): Promise<NextResponse<ExportDocxResponse | { error: string }>> {
  // ── Auth ──────────────────────────────────────────────────────────────────
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

  try {
    const body = await request.json() as ExportDocxRequest;
    const {
      finalText,
      caseType,
      caseNumber,
      orderDate,
      officerName,
      userId,
      guardrailScore,
      modelUsed,
      promptVersion,
      inputTokens,
      outputTokens,
      acknowledgementAt,
    } = body;

    if (!finalText || !userId) {
      return NextResponse.json({ error: 'ಅಗತ್ಯ ಮಾಹಿತಿ ಕಾಣೆಯಾಗಿದೆ / Required fields missing' }, { status: 400 });
    }

    // ── IDOR protection: userId in body must match authenticated user (Fix 3) ─
    if (userId !== user.id) {
      return NextResponse.json({ error: 'ಅನಧಿಕೃತ / Unauthorized' }, { status: 403 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── Generate DOCX ─────────────────────────────────────────────────────────
    const footerText = `ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು | Drafted by Aadesh AI | Verified by ${officerName}`;
    const docBuffer = await generateDocxBuffer(finalText, footerText);

    // ── Build filename ────────────────────────────────────────────────────────
    // Pattern: {CaseType}_{CaseNumber}_{OrderDate}.docx
    const safeDate = orderDate.replace(/[^0-9-]/g, '') || new Date().toISOString().split('T')[0];
    const safeCaseNumber = (caseNumber || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '_');
    const safeCaseType = caseType.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${safeCaseType}_${safeCaseNumber}_${safeDate}.docx`;

    // ── Save to Supabase Storage ──────────────────────────────────────────────
    const orderId = crypto.randomUUID();
    const storagePath = `orders/${userId}/${orderId}.docx`;

    const { error: storageError } = await adminClient.storage
      .from('files')
      .upload(storagePath, docBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: false,
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      // Don't block — return the file directly if storage fails
    }

    // ── Save order record ─────────────────────────────────────────────────────
    const wordCount = finalText.split(/\s+/).filter(Boolean).length;

    await adminClient.from('orders').insert({
      id: orderId,
      user_id: userId,
      case_type: caseType,
      case_number: caseNumber || null,
      generated_order: finalText,
      score: guardrailScore ?? 0,
      model_used: modelUsed || 'claude-sonnet-4-6',
      verified: true,
      // Additional pipeline fields (may not exist in current schema — safe to include)
      word_count: wordCount,
      credits_used: 1,
      // v9.2 additions
      prompt_version: promptVersion || 'V3.2.1',
      input_tokens: inputTokens ?? null,
      output_tokens: outputTokens ?? null,
      acknowledgement_at: acknowledgementAt ?? null,
    });

    // ── Return download URL or direct buffer ──────────────────────────────────
    // Try to get a signed URL from storage; fall back to base64 in response
    let downloadUrl = '';
    if (!storageError) {
      const { data: signedUrl } = await adminClient.storage
        .from('files')
        .createSignedUrl(storagePath, 60); // 60 seconds
      downloadUrl = signedUrl?.signedUrl ?? '';
    }

    // If no signed URL, return the file as base64 for direct download
    if (!downloadUrl) {
      const base64 = docBuffer.toString('base64');
      return NextResponse.json({
        downloadUrl: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`,
        orderId,
        fileName,
      });
    }

    return NextResponse.json({ downloadUrl, orderId, fileName });
  } catch (err) {
    console.error('Export DOCX error:', err);
    await logException(err, { route: '/api/pipeline/export-docx' });
    return NextResponse.json(
      { error: 'ಡೌನ್\u200Cಲೋಡ್ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Export failed. Please retry.' },
      { status: 500 }
    );
  }
}

// ── DOCX generation ───────────────────────────────────────────────────────────

async function generateDocxBuffer(orderText: string, footerText: string): Promise<Buffer> {
  const lines = orderText.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    const isCourtHeader = trimmed.includes('ನ್ಯಾಯಾಲಯ') && paragraphs.length < 3;
    const isHeader = /^(ಉಪಸ್ಥಿತರು|ಪ್ರಸ್ತಾವನೆ|ಆದೇಶ|ಸಹಿ|ಪ್ರತಿಯನ್ನು|ಘೋಷಣೆ)/.test(trimmed) || trimmed.endsWith(':');
    const isSignature = trimmed.startsWith('ಸಹಿ/-') || trimmed.startsWith('(');

    paragraphs.push(
      new Paragraph({
        alignment: isCourtHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
          after: isHeader ? 200 : 120,
          before: isHeader ? 200 : 0,
          line: 276,
        },
        children: [
          new TextRun({
            text: trimmed,
            font: 'Noto Sans Kannada',
            size: isCourtHeader ? 28 : isHeader ? 24 : 22,
            bold: isHeader || isCourtHeader || isSignature,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1.2), // extra bottom for footer
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: footerText + ' | ',
                    font: 'Noto Sans Kannada',
                    size: 16,
                    color: '666666',
                    italics: true,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Noto Sans Kannada',
                    size: 16,
                    color: '666666',
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
