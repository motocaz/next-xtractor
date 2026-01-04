'use client';

import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { renderPageAsImage } from '@/lib/pdf/canvas-utils';
import type { PDFFileInfo } from '@/hooks/useMultiPDFLoader';

export const renderAllPagesAsThumbnails = async (
  pdfFiles: PDFFileInfo[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string>> => {
  const thumbnailMap = new Map<string, string>();
  let currentPage = 0;
  let totalPages = 0;

  pdfFiles.forEach((pdf) => {
    totalPages += pdf.pageCount;
  });

  for (const pdfInfo of pdfFiles) {
    try {
      const pdfBytes = await pdfInfo.pdfDoc.save();
      const arrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer;
      const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);

      for (let i = 1; i <= pdfInfo.pageCount; i++) {
        currentPage++;
        
        if (onProgress) {
          onProgress(currentPage, totalPages);
        }

        const pageId = `${pdfInfo.id}-${i - 1}`;
        const imageUrl = await renderPageAsImage(pdfJsDoc, i, 0.3);
        thumbnailMap.set(pageId, imageUrl);

        if (currentPage % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    } catch (error) {
      console.error(`Error rendering thumbnails for ${pdfInfo.fileName}:`, error);
      throw new Error(`Failed to render thumbnails for ${pdfInfo.fileName}`);
    }
  }

  return thumbnailMap;
};

