'use client';

import {
  convertImagesToPdf,
  convertImageToPngBytes,
  type ImageToPdfResult,
} from '@/lib/pdf/image-to-pdf-utils';

export interface WebpToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

export const webpToPdf = async (files: File[]): Promise<WebpToPdfResult> => {
  const result = await convertImagesToPdf(
    files,
    convertImageToPngBytes,
    'Please select at least one WebP file.'
  );
  return result;
};

