'use client';

import { PDFDocument } from 'pdf-lib';

export const reversePagesInPDF = async (pdfDoc: PDFDocument): Promise<Uint8Array> => {
  const newPdf = await PDFDocument.create();
  const pageCount = pdfDoc.getPageCount();

  const reversedIndices = Array.from(
    { length: pageCount },
    (_, i) => pageCount - 1 - i
  );

  const copiedPages = await newPdf.copyPages(pdfDoc, reversedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
};

