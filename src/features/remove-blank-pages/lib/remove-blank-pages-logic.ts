"use client";

import type { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFLibDocument } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { isPageBlank } from "@/lib/pdf/blank-page-detector";
import { renderPageAsImage } from "@/lib/pdf/canvas-utils";
import type { PageAnalysisData, AnalysisResult } from "../types";

export const analyzePagesForBlankDetection = async (
  pdfJsDoc: PDFDocumentProxy,
  sensitivity: number,
  onProgress?: (current: number, total: number) => void,
): Promise<PageAnalysisData[]> => {
  const totalPages = pdfJsDoc.numPages;

  const promises: Promise<PageAnalysisData>[] = [];

  for (let i = 1; i <= totalPages; i++) {
    promises.push(
      pdfJsDoc.getPage(i).then(async (page) => {
        const isBlank = await isPageBlank(page, sensitivity);
        onProgress?.(i, totalPages);
        return {
          pageNum: i,
          pageRef: page,
          isBlank,
        };
      }),
    );
  }

  const results = await Promise.all(promises);
  return results;
};

export const updateAnalysisWithSensitivity = async (
  analysisData: PageAnalysisData[],
  sensitivity: number,
  pdfJsDoc: PDFDocumentProxy,
): Promise<AnalysisResult> => {
  const pagesToRemove: number[] = [];
  const updatedAnalysisData: PageAnalysisData[] = [];

  for (const pageData of analysisData) {
    const isBlank = await isPageBlank(pageData.pageRef, sensitivity);
    updatedAnalysisData.push({
      ...pageData,
      isBlank,
    });

    if (isBlank) {
      pagesToRemove.push(pageData.pageNum);
    }
  }

  for (const pageData of updatedAnalysisData) {
    if (pageData.isBlank) {
      try {
        const thumbnailUrl = await renderPageAsImage(
          pdfJsDoc,
          pageData.pageNum,
          0.1,
        );
        pageData.thumbnailUrl = thumbnailUrl;
      } catch (error) {
        console.error(
          `Failed to generate thumbnail for page ${pageData.pageNum}:`,
          error,
        );
      }
    }
  }

  let message: string;
  if (pagesToRemove.length > 0) {
    message = `Found ${pagesToRemove.length} blank page(s) to remove: ${pagesToRemove.join(", ")}`;
  } else {
    message = "No blank pages found at this sensitivity level.";
  }

  return {
    pagesToRemove,
    analysisData: updatedAnalysisData,
    message,
  };
};

export const removeBlankPages = async (
  pdfDoc: PDFDocument,
  pagesToKeep: number[],
): Promise<Uint8Array> => {
  if (pagesToKeep.length === 0) {
    throw new Error("Cannot remove all pages. At least one page must be kept.");
  }

  if (pagesToKeep.length === pdfDoc.getPageCount()) {
    throw new Error("No blank pages found to remove.");
  }

  const newPdf = await PDFLibDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  return newPdfBytes;
};
