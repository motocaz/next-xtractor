'use client';

import JSZip from 'jszip';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { encodeBMP } from '@/lib/pdf/bmp-utils';

export const pdfToBmp = async (
  pdfFile: File,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<Blob> => {
  const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const zip = new JSZip();

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    onProgress?.(i, pdfJsDoc.numPages);
    
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    
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

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const bmpBuffer = encodeBMP(imageData);

    zip.file(`page_${i}.bmp`, bmpBuffer);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

