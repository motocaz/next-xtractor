'use client';

import { pdfToImageZip } from '@/lib/pdf/pdf-to-image-utils';
import { canvasToPngBlob } from '@/lib/pdf/canvas-utils';

export const pdfToPng = async (
  pdfFile: File,
  scale: number,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<Blob> => {
  return pdfToImageZip(pdfFile, {
    scale,
    fileExtension: 'png',
    converter: canvasToPngBlob,
    converterType: 'canvas',
    onProgress,
  });
};

