"use client";

import type { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFLibDocument } from "pdf-lib";

const parsePagesToDelete = (
  rangeString: string,
  totalPages: number
): Set<number> => {
  const indicesToDelete = new Set<number>();

  if (!rangeString || rangeString.trim() === "") {
    return indicesToDelete;
  }

  const ranges = rangeString.split(",");

  for (const range of ranges) {
    const trimmedRange = range.trim();
    if (!trimmedRange) continue;

    if (trimmedRange.includes("-")) {
      const [start, end] = trimmedRange.split("-").map(Number);
      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      ) {
        continue;
      }
      for (let i = start; i <= end; i++) {
        indicesToDelete.add(i - 1);
      }
    } else {
      const pageNum = Number(trimmedRange);
      if (Number.isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
      indicesToDelete.add(pageNum - 1);
    }
  }

  return indicesToDelete;
};

export const deletePages = async (
  pdfDoc: PDFDocument,
  pagesToDeleteInput: string
): Promise<Blob> => {
  const totalPages = pdfDoc.getPageCount();

  if (!pagesToDeleteInput || pagesToDeleteInput.trim() === "") {
    throw new Error("Please enter page numbers to delete.");
  }

  const indicesToDelete = parsePagesToDelete(pagesToDeleteInput, totalPages);

  if (indicesToDelete.size === 0) {
    throw new Error("No valid pages selected for deletion.");
  }

  if (indicesToDelete.size >= totalPages) {
    throw new Error("You cannot delete all pages.");
  }

  const indicesToKeep = Array.from({ length: totalPages }, (_, i) => i).filter(
    (index) => !indicesToDelete.has(index)
  );

  const newPdf = await PDFLibDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indicesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  return new Blob([new Uint8Array(newPdfBytes)], { type: "application/pdf" });
};
