"use client";

import { PDFDocument } from "pdf-lib";
import type { SplitType } from "../types";

export const splitInHalf = async (
  pdfDoc: PDFDocument,
  splitType: SplitType,
  onProgress?: (current: number, total: number) => void,
): Promise<Uint8Array> => {
  const newPdfDoc = await PDFDocument.create();
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const originalPage = pages[i];
    const { width, height } = originalPage.getSize();

    onProgress?.(i + 1, totalPages);

    const [page1] = await newPdfDoc.copyPages(pdfDoc, [i]);
    const [page2] = await newPdfDoc.copyPages(pdfDoc, [i]);

    switch (splitType) {
      case "vertical":
        page1.setCropBox(0, 0, width / 2, height);
        page2.setCropBox(width / 2, 0, width / 2, height);
        break;
      case "horizontal":
        page1.setCropBox(0, height / 2, width, height / 2);
        page2.setCropBox(0, 0, width, height / 2);
        break;
    }

    newPdfDoc.addPage(page1);
    newPdfDoc.addPage(page2);
  }

  const newPdfBytes = await newPdfDoc.save();
  return newPdfBytes;
};
