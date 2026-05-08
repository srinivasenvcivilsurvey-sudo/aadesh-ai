/**
 * Kannada-aware PDF generator using pdfmake with embedded Noto Sans Kannada.
 * Server-side only.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const FONT_TTF_URL =
  'https://fonts.gstatic.com/s/notosanskannada/v26/8JMZB6E-9-3F-dZKbM4nMslkALJV6BO5HHcNVaWLc6A.ttf';

const FONT_CACHE_PATH = path.join(os.tmpdir(), 'NotoSansKannada-Aadesh.ttf');
const FONT_NAME = 'NotoSansKannada';

let fontBufferPromise: Promise<Buffer> | null = null;

async function loadKannadaFont(): Promise<Buffer> {
  if (fontBufferPromise) return fontBufferPromise;
  fontBufferPromise = (async () => {
    if (fs.existsSync(FONT_CACHE_PATH)) {
      const cached = fs.readFileSync(FONT_CACHE_PATH);
      if (cached.length > 1000) return cached;
    }
    const res = await fetch(FONT_TTF_URL);
    if (!res.ok) {
      throw new Error(`Font fetch failed (${res.status})`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    try {
      fs.writeFileSync(FONT_CACHE_PATH, buf);
    } catch (err) {
      console.warn('[pdf-kannada] could not cache font to tmpdir:', err);
    }
    return buf;
  })().catch(err => {
    fontBufferPromise = null;
    throw err;
  });
  return fontBufferPromise;
}

interface PdfMakeContent {
  text: string;
  alignment?: 'left' | 'center' | 'right';
  bold?: boolean;
  fontSize?: number;
  margin?: [number, number, number, number];
}

export async function generateKannadaPdf(
  orderText: string,
  orderType?: string
): Promise<Buffer> {
  const fontBuffer = await loadKannadaFont();

  // pdfmake's printer is the server-side renderer. require() avoids static
  // module-resolution issues if the package is missing at lint time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const PdfPrinter = require('pdfmake') as any;

  const printer = new PdfPrinter({
    [FONT_NAME]: {
      normal: fontBuffer,
      bold: fontBuffer,
      italics: fontBuffer,
      bolditalics: fontBuffer,
    },
  });

  const content: PdfMakeContent[] = [];
  const headerLabel =
    orderType === 'suo_motu' ? 'ಸ್ವಯಂಪ್ರೇರಿತ ಆದೇಶ' : 'ಮೇಲ್ಮನವಿ ಆದೇಶ';
  content.push({
    text: `ಆದೇಶ AI | ${headerLabel}`,
    alignment: 'right',
    fontSize: 9,
    margin: [0, 0, 0, 14],
  });

  const lines = orderText.split(/\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      content.push({ text: ' ', fontSize: 6, margin: [0, 0, 0, 4] });
      continue;
    }
    const isCourtHeader =
      line.includes('ನ್ಯಾಯಾಲಯ') && content.length < 4;
    const isHeader =
      /^(ಉಪಸ್ಥಿತರು|ಪ್ರಸ್ತಾವನೆ|ಆದೇಶ|ಸಹಿ|ಪ್ರತಿಯನ್ನು|ಘೋಷಣೆ)/.test(line) ||
      line.endsWith(':');
    const isSignature = line.startsWith('ಸಹಿ/-') || line.startsWith('(');

    content.push({
      text: line,
      alignment: isCourtHeader ? 'center' : 'left',
      bold: isCourtHeader || isHeader || isSignature,
      fontSize: isCourtHeader ? 14 : isHeader ? 12 : 11,
      margin: [0, isHeader ? 8 : 0, 0, isHeader ? 6 : 4],
    });
  }

  const docDefinition = {
    pageMargins: [72, 72, 72, 72] as [number, number, number, number],
    defaultStyle: { font: FONT_NAME, fontSize: 11, lineHeight: 1.3 },
    content,
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', (err: Error) => reject(err));
    pdfDoc.end();
  });
}
