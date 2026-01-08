import type { PDFDocument } from "pdf-lib";

export interface UseExtractPagesReturn {
  pagesToExtract: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPagesToExtract: (value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  extractPages: () => Promise<void>;
  reset: () => void;
}
