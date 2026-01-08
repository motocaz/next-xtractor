import type { PDFDocument } from "pdf-lib";

export interface UsePdfToPngReturn {
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
  scale: number;
  setScale: (scale: number) => void;
  processPdfToPng: () => Promise<void>;
  reset: () => void;
}
