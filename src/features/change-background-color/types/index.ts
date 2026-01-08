import type { PDFDocument } from "pdf-lib";

export interface UseChangeBackgroundColorReturn {
  backgroundColor: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setBackgroundColor: (color: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processBackgroundColor: () => Promise<void>;
  reset: () => void;
}
