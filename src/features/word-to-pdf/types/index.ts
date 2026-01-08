export interface UseWordToPdfReturn {
  wordFile: File | null;
  htmlContent: string | null;
  isLoading: boolean;
  loadingMessage: string | null;
  isProcessing: boolean;
  processingMessage: string | null;
  error: string | null;
  loadWordFile: (file: File) => Promise<void>;
  convertToHtml: () => Promise<void>;
  generatePdf: () => Promise<void>;
  convertAndDownloadPdf: () => Promise<void>;
  reset: () => void;
}
