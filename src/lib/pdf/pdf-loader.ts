import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from './file-utils';

export interface LoadPDFResult {
  pdfDoc: PDFDocument;
  isEncrypted: boolean;
}

export const loadPDFDocument = async (
  file: File
): Promise<LoadPDFResult> => {
  const pdfBytes = await readFileAsArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
  });

  return {
    pdfDoc,
    isEncrypted: pdfDoc.isEncrypted,
  };
};


