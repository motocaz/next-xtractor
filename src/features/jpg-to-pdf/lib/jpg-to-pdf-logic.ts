'use client';

import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { convertImageToJpegBytes } from '@/features/image-to-pdf/lib/image-to-pdf-logic';
import type { ImageToPdfResult } from '@/lib/pdf/image-to-pdf-utils';

export interface JpgToPdfResult {
  pdfDoc: ImageToPdfResult['pdfDoc'];
  successCount: number;
  failedFiles: string[];
}

export const jpgToPdf = async (files: File[]): Promise<JpgToPdfResult> => {
  if (files.length === 0) {
    throw new Error('Please select at least one JPG file.');
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const originalBytes = await readFileAsArrayBuffer(file);
      let jpgImage;

      try {
        jpgImage = await pdfDoc.embedJpg(new Uint8Array(originalBytes));
      } catch {
        console.warn(
          `Direct JPG embedding failed for ${file.name}, attempting to sanitize...`
        );
        try {
          const sanitizedBytes = await convertImageToJpegBytes(file, 0.9);
          jpgImage = await pdfDoc.embedJpg(sanitizedBytes);
        } catch (fallbackError) {
          console.error(
            `Failed to process ${file.name} after sanitization:`,
            fallbackError
          );
          throw new Error(
            `Could not process "${file.name}". The file may be corrupted.`
          );
        }
      }

      const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: jpgImage.width,
        height: jpgImage.height,
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

