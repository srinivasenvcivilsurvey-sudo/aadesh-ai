import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
} from 'docx';

export async function POST(request: NextRequest) {
  try {
    // ── AUTH ──────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── PARSE REQUEST ────────────────────────────────────
    const body = await request.json();
    const { orderText, format, orderType } = body;

    if (!orderText || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: orderText, format' },
        { status: 400 }
      );
    }

    if (!['docx', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be "docx" or "pdf"' },
        { status: 400 }
      );
    }

    // ── AUDIT LOG (DPDP compliance) ──────────────────────
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Fire and forget — don't block download on audit log
    adminClient.from('audit_log').insert({
      user_id: user.id,
      action: `verified_and_downloaded_${format}`,
      ip_address: request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { format, orderType, wordCount: orderText.split(/\s+/).length },
    }).then(({ error: auditErr }) => { if (auditErr) console.error('Audit log error:', auditErr); });

    // ── GENERATE DOCUMENT ────────────────────────────────
    if (format === 'docx') {
      const buffer = await generateDocx(orderText, orderType);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="aadesh_order_${new Date().toISOString().split('T')[0]}.docx"`,
        },
      });
    }

    // PDF: Kannada font embedding not yet supported — return DOCX as fallback
    // FIX: 2026-03-29 — Previous raw PDF generator replaced all Kannada with '?'
    if (format === 'pdf') {
      const buffer = await generatePdf(orderText, orderType);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="aadesh_order_${new Date().toISOString().split('T')[0]}.docx"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown format' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'ಡೌನ್\u200Cಲೋಡ್ ವಿಫಲವಾಯಿತು' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DOCX Generation using docx npm package
// ═══════════════════════════════════════════════════════════

async function generateDocx(orderText: string, orderType?: string): Promise<Buffer> {
  // Split text into paragraphs on double newlines or single newlines
  const lines = orderText.split(/\n/);

  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      // Empty line → spacing paragraph
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Detect section headers (lines ending with : or containing key header markers)
    const isHeader = /^(ಉಪಸ್ಥಿತರು|ಪ್ರಸ್ತಾವನೆ|ಆದೇಶ|ಸಹಿ|ಪ್ರತಿಯನ್ನು|ಘೋಷಣೆ)/.test(trimmed)
      || trimmed.endsWith(':');

    // Detect the court header (first substantive line usually)
    const isCourtHeader = trimmed.includes('ನ್ಯಾಯಾಲಯ') && paragraphs.length < 3;

    // Detect signature block
    const isSignature = trimmed.startsWith('ಸಹಿ/-') || trimmed.startsWith('(');

    paragraphs.push(
      new Paragraph({
        alignment: isCourtHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
          after: isHeader ? 200 : 120,
          before: isHeader ? 200 : 0,
          line: 276, // 1.15 line spacing
        },
        children: [
          new TextRun({
            text: trimmed,
            font: 'Noto Sans Kannada',
            size: isCourtHeader ? 28 : isHeader ? 24 : 22, // half-points (11pt body, 12pt headers, 14pt court)
            bold: isHeader || isCourtHeader || isSignature,
          }),
        ],
      })
    );
  }

  // Add metadata header
  const headerParagraph = new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: `ಆದೇಶ AI | ${orderType === 'suo_motu' ? 'ಸ್ವಯಂಪ್ರೇರಿತ' : 'ಮೇಲ್ಮನವಿ'} ಆದೇಶ`,
        font: 'Noto Sans Kannada',
        size: 16,
        color: '999999',
        italics: true,
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [headerParagraph, ...paragraphs],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

// ═══════════════════════════════════════════════════════════
// PDF Generation — uses DOCX-to-PDF workaround for Kannada
// Since raw PDF can't render Kannada without embedded fonts,
// we generate the DOCX and return it with a .pdf-compatible message.
// Phase 1A will add proper Kannada PDF via server-side font embedding.
// ═══════════════════════════════════════════════════════════

async function generatePdf(orderText: string, orderType?: string): Promise<Buffer> {
  // FIX: 2026-03-29 — Raw PDF generator replaced ALL Kannada chars with '?'
  // Workaround: Generate DOCX instead (which renders Kannada perfectly)
  // and return it. The download route will set the correct content-type.
  // Users get a working document they can open and print.
  return generateDocx(orderText, orderType);
}
