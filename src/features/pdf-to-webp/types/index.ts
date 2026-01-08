import type { PDFDocument } from "pdf-lib";

export interface UsePdfToWebpReturn {
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
  quality: number;
  setQuality: (quality: number) => void;
  processPdfToWebp: () => Promise<void>;
  reset: () => void;
}
