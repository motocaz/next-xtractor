'use client';

import { pdfToImageZip } from '@/lib/pdf/pdf-to-image-utils';
import { encodeBMP } from '@/lib/pdf/bmp-utils';

const PROCESSING_SCALE = 1.5;

export const pdfToBmp = async (
  pdfFile: File,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<Blob> => {
  return pdfToImageZip(pdfFile, {
    scale: PROCESSING_SCALE,
    fileExtension: 'bmp',
    converter: encodeBMP,
    converterType: 'imagedata',
    onProgress,
  });
};

