import type { PDFDocument } from 'pdf-lib';

export interface UsePdfToJpgReturn {
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
  processPdfToJpg: () => Promise<void>;
  reset: () => void;
}

