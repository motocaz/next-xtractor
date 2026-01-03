'use client';

import {
  convertImagesToPdf,
  convertImageToPngBytes,
  type ImageToPdfResult,
} from '@/lib/pdf/image-to-pdf-utils';

export interface BmpToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

export const bmpToPdf = async (files: File[]): Promise<BmpToPdfResult> => {
  const result = await convertImagesToPdf(
    files,
    convertImageToPngBytes,
    'Please select at least one BMP file.'
  );
  return result;
};

