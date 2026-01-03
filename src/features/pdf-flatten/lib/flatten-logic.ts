'use client';

import type { PDFDocument } from 'pdf-lib';

export const flattenPDF = async (pdfDoc: PDFDocument): Promise<PDFDocument> => {
  try {
    const form = pdfDoc.getForm();
    form.flatten();
    return pdfDoc;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('getForm')) {
      throw new Error('This PDF does not contain any form fields to flatten.');
    }
    throw new Error('Could not flatten the PDF.');
  }
};

