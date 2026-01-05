'use client';

import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { renderPageAsImage } from '@/lib/pdf/canvas-utils';

export interface MultiToolThumbnail {
  pdfIndex: number;
  pageIndex: number;
  imageUrl: string;
}

export const renderMultiplePDFsAsThumbnails = async (
  pdfBuffers: ArrayBuffer[],
  onProgress?: (current: number, total: number) => void
): Promise<MultiToolThumbnail[]> => {
  const thumbnails: MultiToolThumbnail[] = [];
  let totalPages = 0;
  let currentPage = 0;

  const bufferCopies = pdfBuffers.map((buffer) => buffer.slice(0));
  
  for (const bufferCopy of bufferCopies) {
    const freshCopy = bufferCopy.slice(0);
    const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(freshCopy);
    totalPages += pdfJsDoc.numPages;
  }

  for (let pdfIndex = 0; pdfIndex < bufferCopies.length; pdfIndex++) {
    const bufferCopy = bufferCopies[pdfIndex];
    const freshCopy = bufferCopy.slice(0);
    const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(freshCopy);
    const numPages = pdfJsDoc.numPages;

    for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
      currentPage++;
      const imageUrl = await renderPageAsImage(pdfJsDoc, pageIndex + 1, 0.5);
      thumbnails.push({
        pdfIndex,
        pageIndex,
        imageUrl,
      });

      if (onProgress) {
        onProgress(currentPage, totalPages);
      }

      if (currentPage % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  return thumbnails;
};

