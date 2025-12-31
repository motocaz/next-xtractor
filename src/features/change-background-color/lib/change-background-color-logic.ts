import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';
import type { PDFDocument } from 'pdf-lib';
import { hexToRgb } from '@/lib/pdf/file-utils';

export const changeBackgroundColor = async (
  pdfDoc: PDFDocument,
  colorHex: string
): Promise<PDFDocument> => {
  const newPdfDoc = await PDFLibDocument.create();
  const color = hexToRgb(colorHex);

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const [originalPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
    const { width, height } = originalPage.getSize();

    const newPage = newPdfDoc.addPage([width, height]);

    newPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(color.r, color.g, color.b),
    });

    const embeddedPage = await newPdfDoc.embedPage(originalPage);
    newPage.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return newPdfDoc;
};

