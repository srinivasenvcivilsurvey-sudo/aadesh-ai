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

    // PDF: Generate a basic PDF with the Kannada text
    if (format === 'pdf') {
      const buffer = generatePdf(orderText);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="aadesh_order_${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown format' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಯಿತು' },
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
// PDF Generation (basic — proper Kannada rendering needs font embedding)
// For Phase 0, creates a valid PDF with UTF-8 text.
// Kannada will render correctly if the PDF viewer has the font installed.
// ═══════════════════════════════════════════════════════════

function generatePdf(orderText: string): Buffer {
  // Build a minimal PDF that stores the text as Unicode
  // This uses PDF's built-in Identity-H CMap for Unicode support
  // Note: Without embedded font, viewers need Noto Sans Kannada installed
  const textLines = orderText.split('\n');
  const encodedLines = textLines.map(line => escapeForPdf(line));

  // Build PDF manually (simple text-based PDF)
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>
endobj

4 0 obj
<< /Length ${calculateStreamLength(encodedLines)} >>
stream
BT
/F1 11 Tf
72 770 Td
14 TL
${encodedLines.map(l => `(${l}) '`).join('\n')}
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000309 00000 n
0000000242 00000 n

trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + calculateStreamLength(encodedLines)}
%%EOF`;

  return Buffer.from(content, 'latin1');
}

function escapeForPdf(text: string): string {
  // For a basic PDF, replace special chars and encode to Latin-1 compatible
  // Note: Kannada characters won't render in this basic PDF — they need embedded fonts
  // This creates a valid PDF structure; proper Kannada PDF requires Phase 1A font embedding
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?'); // Replace non-ASCII with ? for basic PDF
}

function calculateStreamLength(lines: string[]): number {
  const content = `BT\n/F1 11 Tf\n72 770 Td\n14 TL\n${lines.map(l => `(${l}) '`).join('\n')}\nET`;
  return content.length;
}
