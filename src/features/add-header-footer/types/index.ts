import type { PDFDocument } from 'pdf-lib';

export interface HeaderFooterOptions {
  fontSize: number;
  fontColor: string;
  pageRange: string;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

export interface UseAddHeaderFooterReturn {
  pageRange: string;
  fontSize: string;
  fontColor: string;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPageRange: (value: string) => void;
  setFontSize: (value: string) => void;
  setFontColor: (value: string) => void;
  setHeaderLeft: (value: string) => void;
  setHeaderCenter: (value: string) => void;
  setHeaderRight: (value: string) => void;
  setFooterLeft: (value: string) => void;
  setFooterCenter: (value: string) => void;
  setFooterRight: (value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processHeaderFooter: () => Promise<void>;
  reset: () => void;
}

