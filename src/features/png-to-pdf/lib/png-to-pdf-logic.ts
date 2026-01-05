'use client';

import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import {
  addImageAsPage,
  createImageToPdfResult,
  type ImageToPdfResult,
} from '@/lib/pdf/image-to-pdf-utils';

export interface PngToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

export const pngToPdf = async (files: File[]): Promise<PngToPdfResult> => {
  if (files.length === 0) {
    throw new Error('Please select at least one PNG file.');
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const pngBytes = await readFileAsArrayBuffer(file);
      const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes));
      addImageAsPage(pdfDoc, pngImage);
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  return createImageToPdfResult(pdfDoc, failedFiles);
};

