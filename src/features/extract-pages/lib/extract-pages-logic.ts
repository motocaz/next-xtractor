"use client";

import type { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFLibDocument } from "pdf-lib";
import { parsePageRanges } from "@/lib/pdf/file-utils";

export const extractPages = async (
  pdfDoc: PDFDocument,
  pageRangesInput: string,
): Promise<Uint8Array[]> => {
  const totalPages = pdfDoc.getPageCount();

  if (!pageRangesInput || pageRangesInput.trim() === "") {
    throw new Error("Please enter page numbers to extract.");
  }

  const pageIndices = parsePageRanges(pageRangesInput, totalPages);

  if (pageIndices.length === 0) {
    throw new Error("No valid pages selected for extraction.");
  }

  const extractedPDFs: Uint8Array[] = [];

  for (const index of pageIndices) {
    const newPdf = await PDFLibDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    extractedPDFs.push(pdfBytes);
  }

  return extractedPDFs;
};
