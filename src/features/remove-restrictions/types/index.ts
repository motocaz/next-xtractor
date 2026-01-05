import type { PDFDocument } from 'pdf-lib';

export interface UseRemoveRestrictionsReturn {
  ownerPassword: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setOwnerPassword: (password: string) => void;
  loadPDF: (file: File) => Promise<void>;
  removeRestrictions: () => Promise<void>;
  reset: () => void;
}

