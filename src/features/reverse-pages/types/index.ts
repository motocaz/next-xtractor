import type { PDFFileInfo } from '@/hooks/useMultiPDFLoader';

export interface UseReversePagesReturn {
  pdfFiles: PDFFileInfo[];
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  warning: string | null;
  isProcessing: boolean;
  processingLoadingMessage: string | null;
  processingError: string | null;
  processingSuccess: string | null;
  loadPDFs: (files: File[]) => Promise<void>;
  removePDF: (id: string) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  reversePages: () => Promise<void>;
  reset: () => void;
}

