'use client';

import { PDFDocument } from 'pdf-lib';
import {
  convertImageToPngBytes,
  addImageAsPage,
  createImageToPdfResult,
  type ImageToPdfResult,
} from '@/lib/pdf/image-to-pdf-utils';

export interface SvgToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

export const svgToPdf = async (files: File[]): Promise<SvgToPdfResult> => {
  if (files.length === 0) {
    throw new Error('Please select at least one SVG file.');
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const pngBytes = await convertImageToPngBytes(file);
      const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes));
      addImageAsPage(pdfDoc, pngImage);
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  return createImageToPdfResult(pdfDoc, failedFiles);
};

