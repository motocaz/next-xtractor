'use client';

import { pdfToImageZip } from '@/lib/pdf/pdf-to-image-utils';
import { canvasToJpgBlob } from '@/lib/pdf/canvas-utils';

const PROCESSING_SCALE = 2.0;

export const pdfToJpg = async (
  pdfFile: File,
  quality: number,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<Blob> => {
  return pdfToImageZip(pdfFile, {
    scale: PROCESSING_SCALE,
    fileExtension: 'jpg',
    converter: canvasToJpgBlob,
    converterType: 'canvas',
    converterOptions: quality,
    onProgress,
  });
};

