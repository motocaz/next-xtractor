'use client';

import JSZip from 'jszip';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { canvasToJpgBlob } from '@/lib/pdf/canvas-utils';

const PROCESSING_SCALE = 2.0;

export const pdfToJpg = async (
  pdfFile: File,
  quality: number,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<Blob> => {
  const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const zip = new JSZip();

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    onProgress?.(i, pdfJsDoc.numPages);
    
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: PROCESSING_SCALE });
    
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

    const jpgBlob = await canvasToJpgBlob(canvas, quality);
    zip.file(`page_${i}.jpg`, jpgBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

