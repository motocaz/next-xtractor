"use client";

import { PDFDocument, degrees } from "pdf-lib";
import type { MultiToolPageData } from "../types";
import { saveAndDownloadPDF, downloadFile } from "@/lib/pdf/file-utils";
import JSZip from "jszip";

export const applyRotationToPage = (
  page: ReturnType<PDFDocument["addPage"]>,
  rotation: number
): void => {
  if (rotation !== 0) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  }
};

export const createBlankPage = (pdfDoc: PDFDocument): void => {
  pdfDoc.addPage([595, 842]);
};

export const createPDFFromPages = async (
  pages: MultiToolPageData[]
): Promise<Uint8Array> => {
  const newPdf = await PDFDocument.create();

  for (const pageData of pages) {
    if (pageData.isBlankPage) {
    } else if (pageData.pdfDoc && pageData.originalPageIndex >= 0) {
      const [copiedPage] = await newPdf.copyPages(pageData.pdfDoc, [
        pageData.originalPageIndex,
      ]);
      const page = newPdf.addPage(copiedPage);

      applyRotationToPage(page, pageData.rotation);
    } else {
      newPdf.addPage([595, 842]);
    }
  }

  return await newPdf.save();
};

export const createSplitPDFs = async (
  pages: MultiToolPageData[],
  splitMarkers: Set<string>
): Promise<Blob> => {
  const zip = new JSZip();
  const segments: MultiToolPageData[][] = [];
  let currentSegment: MultiToolPageData[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    currentSegment.push(page);

    if (splitMarkers.has(page.id)) {
      segments.push(currentSegment);
      currentSegment = [];
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  for (let segIndex = 0; segIndex < segments.length; segIndex++) {
    const segment = segments[segIndex];
    const pdfBytes = await createPDFFromPages(segment);
    zip.file(`document-${segIndex + 1}.pdf`, pdfBytes);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
};

export const downloadSelectedPages = async (
  pages: MultiToolPageData[],
  selectedPageIds: Set<string>,
  originalFileName?: string
): Promise<void> => {
  const selectedPages = pages.filter((p) => selectedPageIds.has(p.id));
  if (selectedPages.length === 0) {
    throw new Error("No pages selected");
  }

  const pdfBytes = await createPDFFromPages(selectedPages);
  const timestamp = new Date().toISOString();
  const filename = originalFileName
    ? `${timestamp}_${originalFileName.replace(/\.pdf$/i, "")}_selected.pdf`
    : `${timestamp}_selected-pages.pdf`;
  saveAndDownloadPDF(pdfBytes, originalFileName, filename);
};

export const downloadAllPages = async (
  pages: MultiToolPageData[],
  splitMarkers: Set<string>,
  originalFileName?: string
): Promise<void> => {
  if (pages.length === 0) {
    throw new Error("No pages to download");
  }

  if (splitMarkers.size > 0) {
    const zipBlob = await createSplitPDFs(
      pages,
      splitMarkers
    );
    const timestamp = new Date().toISOString();
    const baseName = originalFileName
      ? originalFileName.replace(/\.pdf$/i, "")
      : "split-documents";
    downloadFile(zipBlob, undefined, `${timestamp}_${baseName}.zip`);
  } else {
    const pdfBytes = await createPDFFromPages(pages);
    const timestamp = new Date().toISOString();
    const filename = originalFileName
      ? `${timestamp}_${originalFileName}`
      : `${timestamp}_all-pages.pdf`;
    saveAndDownloadPDF(pdfBytes, originalFileName, filename);
  }
};
