import type { PDFDocument } from 'pdf-lib';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export const addBlankPages = async (
  pdfDoc: PDFDocument,
  position: number,
  pageCount: number
): Promise<PDFDocument> => {
  const newPdf = await PDFLibDocument.create();
  const totalPages = pdfDoc.getPageCount();
  
  const { width, height } = pdfDoc.getPage(0).getSize();
  
  const allIndices = Array.from({ length: totalPages }, (_, i) => i);
  
  const indicesBefore = allIndices.slice(0, position);
  const indicesAfter = allIndices.slice(position);
  
  if (indicesBefore.length > 0) {
    const copied = await newPdf.copyPages(pdfDoc, indicesBefore);
    copied.forEach((page) => newPdf.addPage(page));
  }
  
  for (let i = 0; i < pageCount; i++) {
    newPdf.addPage([width, height]);
  }
  
  if (indicesAfter.length > 0) {
    const copied = await newPdf.copyPages(pdfDoc, indicesAfter);
    copied.forEach((page) => newPdf.addPage(page));
  }
  
  return newPdf;
};

