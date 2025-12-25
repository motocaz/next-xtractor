import type { PDFDocument } from 'pdf-lib';

export interface PageNumbersOptions {
  position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
  fontSize: number;
  format: 'default' | 'page_x_of_y';
  textColor: string;
}

export interface UseAddPageNumbersReturn {
  position: string;
  fontSize: string;
  format: string;
  textColor: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPosition: (value: string) => void;
  setFontSize: (value: string) => void;
  setFormat: (value: string) => void;
  setTextColor: (value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processPageNumbers: () => Promise<void>;
  reset: () => void;
}

