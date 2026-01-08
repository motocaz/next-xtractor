"use client";

import type { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFLibDocument } from "pdf-lib";

export interface PageThumbnailData {
  id: string;
  originalPageIndex: number;
  displayNumber: number;
}

export const buildPageOrder = (pages: PageThumbnailData[]): number[] => {
  return pages.map((page) => page.originalPageIndex);
};

export const processOrganizedPages = async (
  pdfDoc: PDFDocument,
  pageIndices: number[],
): Promise<Uint8Array> => {
  if (!pageIndices || pageIndices.length === 0) {
    throw new Error("No pages to process.");
  }

  const totalPages = pdfDoc.getPageCount();

  for (const index of pageIndices) {
    if (index < 0 || index >= totalPages) {
      throw new Error(`Invalid page index: ${index}`);
    }
  }

  const newPdf = await PDFLibDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  return newPdfBytes;
};
