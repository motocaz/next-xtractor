export interface UsePdfToBmpReturn {
  pdfFile: File | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  totalPages: number;
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;
  processPdfToBmp: () => Promise<void>;
  reset: () => void;
}

