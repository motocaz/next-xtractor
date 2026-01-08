import type { PDFDocument } from "pdf-lib";

export interface UseDecryptPDFReturn {
  password: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPassword: (password: string) => void;
  loadPDF: (file: File) => Promise<void>;
  decryptPDF: () => Promise<void>;
  reset: () => void;
}
