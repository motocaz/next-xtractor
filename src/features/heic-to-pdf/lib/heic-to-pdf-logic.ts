'use client';

import { PDFDocument } from 'pdf-lib';

export interface HeicToPdfResult {
  pdfDoc: PDFDocument;
  successCount: number;
  failedFiles: string[];
}

const convertHeicToPngBytes = async (file: File): Promise<ArrayBuffer> => {
  // Dynamic import to avoid SSR issues - heic2any requires window object
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
  if (files.length === 0) {
    throw new Error('Please select at least one HEIC file.');
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const pngBytes = await convertHeicToPngBytes(file);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error(
      'No valid images could be processed. Please check your files.'
    );
  }

  return {
    pdfDoc,
    successCount: pdfDoc.getPageCount(),
    failedFiles,
  };
};

