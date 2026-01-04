'use client';

import { loadPDFWithPDFJSFromBuffer } from './pdfjs-loader';
import { renderPageAsImage } from './canvas-utils';

export interface PageThumbnail {
  pageNum: number;
  imageUrl: string;
}

export const renderAllPagesAsThumbnails = async (
  pdfBytes: ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<PageThumbnail[]> => {
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(pdfBytes);
  const totalPages = pdfJsDoc.numPages;
  const thumbnails: PageThumbnail[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const imageUrl = await renderPageAsImage(pdfJsDoc, i, 0.5);
    thumbnails.push({
      pageNum: i,
      imageUrl,
    });

    if (onProgress) {
      onProgress(i, totalPages);
    }

    if (i % 5 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return thumbnails;
};

