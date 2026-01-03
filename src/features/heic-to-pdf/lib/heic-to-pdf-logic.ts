'use client';

import {
  convertImagesToPdf,
  convertHeicToPngBytes,
  type ImageToPdfResult,
} from '@/lib/pdf/image-to-pdf-utils';

export interface HeicToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

export const heicToPdf = async (files: File[]): Promise<HeicToPdfResult> => {
  const result = await convertImagesToPdf(
    files,
    convertHeicToPngBytes,
    'Please select at least one HEIC file.'
  );
  return result;
};

