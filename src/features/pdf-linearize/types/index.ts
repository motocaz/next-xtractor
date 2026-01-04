export interface UseLinearizePDFReturn {
  pdfFiles: File[];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  loadPDFs: (files: File[]) => void;
  removePDF: (index: number) => void;
  linearizePDFs: () => Promise<void>;
  reset: () => void;
}

