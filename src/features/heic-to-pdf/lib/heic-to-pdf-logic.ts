'use client';

import { convertImagesToPdf, type ImageToPdfResult } from '@/lib/pdf/image-to-pdf-utils';

export interface HeicToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

const convertHeicToPngBytes = async (file: File): Promise<ArrayBuffer> => {
  const heic2any = (await import('heic2any')).default;
  
  try {
    const conversionResult = await heic2any({
      blob: file,
      toType: 'image/png',
    });

    const pngBlob = Array.isArray(conversionResult)
      ? conversionResult[0]
      : conversionResult;

    if (!pngBlob) {
      throw new Error('Failed to convert HEIC to PNG.');
    }

    const pngBytes = await pngBlob.arrayBuffer();
    return pngBytes;
  } catch (error) {
    throw new Error(
      `Failed to convert HEIC to PNG: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const heicToPdf = async (files: File[]): Promise<HeicToPdfResult> => {
  const result = await convertImagesToPdf(
    files,
    convertHeicToPngBytes,
    'Please select at least one HEIC file.'
  );
  return result;
};

