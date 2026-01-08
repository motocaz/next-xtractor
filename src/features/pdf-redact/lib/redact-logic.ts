"use client";

import { PDFDocument, rgb } from "pdf-lib";
import type { PageRedactions } from "../types";

export const applyRedactions = async (
  pdfDoc: PDFDocument,
  pageRedactions: PageRedactions,
  canvasScale: number,
): Promise<PDFDocument> => {
  const pages = pdfDoc.getPages();
  const conversionScale = 1 / canvasScale;

  for (const pageNumStr in pageRedactions) {
    const pageNum = Number.parseInt(pageNumStr, 10);

    if (pageNum < 1 || pageNum > pages.length) {
      continue;
    }

    const page = pages[pageNum - 1];
    const { height: pageHeight } = page.getSize();
    const redactions = pageRedactions[pageNum];

    for (const redaction of redactions) {
      const pdfX = redaction.x * conversionScale;
      const pdfWidth = redaction.width * conversionScale;
      const pdfHeight = redaction.height * conversionScale;
      const pdfY = pageHeight - redaction.y * conversionScale - pdfHeight;

      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
        color: rgb(0, 0, 0),
      });
    }
  }

  return pdfDoc;
};
