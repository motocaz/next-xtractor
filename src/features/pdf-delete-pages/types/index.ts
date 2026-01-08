import type { PDFDocument } from "pdf-lib";

export interface UseDeletePagesReturn {
  pagesToDelete: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPagesToDelete: (value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  deletePages: () => Promise<void>;
  reset: () => void;
}
