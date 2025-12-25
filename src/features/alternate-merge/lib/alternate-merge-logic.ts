import { PDFDocument } from "pdf-lib";
import type { PDFDocument as PDFLibDocument } from "pdf-lib";

export const alternateMergePDFs = async (
  pdfDocs: PDFLibDocument[]
): Promise<PDFDocument> => {
  if (!pdfDocs || pdfDocs.length === 0) {
    throw new Error("At least one PDF document is required for merging.");
  }

  const newPdfDoc = await PDFDocument.create();
  const pageCounts = pdfDocs.map((doc) => doc.getPageCount());
  const maxPages = Math.max(...pageCounts);

  for (let i = 0; i < maxPages; i++) {
    for (const doc of pdfDocs) {
      if (i < doc.getPageCount()) {
        const [copiedPage] = await newPdfDoc.copyPages(doc, [i]);
        newPdfDoc.addPage(copiedPage);
      }
    }
  }

  return newPdfDoc;
};
