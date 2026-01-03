import type { PDFDocument } from 'pdf-lib';

export interface EncryptPDFOptions {
  userPassword: string;
  ownerPassword?: string;
}

export interface UseEncryptPDFReturn {
  userPassword: string;
  ownerPassword: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setUserPassword: (password: string) => void;
  setOwnerPassword: (password: string) => void;
  loadPDF: (file: File) => Promise<void>;
  encryptPDF: () => Promise<void>;
  reset: () => void;
}

