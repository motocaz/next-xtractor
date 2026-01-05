'use client';

import { PDFDocument, degrees } from 'pdf-lib';
import type { PageRotationState } from '../types';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';

export const applyRotationsToPDF = async (
  pdfDoc: PDFDocument,
  rotations: PageRotationState,
  originalFileName?: string
): Promise<void> => {
  const pages = pdfDoc.getPages();
  
  for (let i = 0; i < pages.length; i++) {
    const rotation = rotations.get(i) || 0;
    if (rotation !== 0) {
      const currentRotation = pages[i].getRotation().angle;
      pages[i].setRotation(degrees(currentRotation + rotation));
    }
  }

  const pdfBytes = await pdfDoc.save();
  saveAndDownloadPDF(pdfBytes, originalFileName);
};

