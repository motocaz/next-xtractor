import type { PDFDocument } from "pdf-lib";

export interface UseFlattenPDFReturn {
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  loadPDF: (file: File) => Promise<void>;
  processFlatten: () => Promise<void>;
  reset: () => void;
}
