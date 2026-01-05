'use client';

import JSZip from 'jszip';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { canvasToTiffBlob } from '@/lib/pdf/canvas-utils';

export const pdfToTiff = async (
  pdfFile: File,
  scale: number,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<Blob> => {
  const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const zip = new JSZip();

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    onProgress?.(i, pdfJsDoc.numPages);
    
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const tiffBlob = await canvasToTiffBlob(canvas);
    zip.file(`page_${i}.tiff`, tiffBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

