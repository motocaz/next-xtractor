import type { PDFDocument } from "pdf-lib";

export interface UsePdfToGreyscaleReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  loadPDF: (file: File) => Promise<void>;
  processPdfToGreyscale: () => Promise<void>;
  reset: () => void;
}
