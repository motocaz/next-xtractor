export interface ChangeTextColorOptions {
  colorHex: string;
}

export interface UseChangeTextColorReturn {
  pdfFile: File | null;
  colorHex: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  isLoadingPDF: boolean;
  pdfError: string | null;

  setColorHex: (color: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processTextColor: () => Promise<void>;
  reset: () => void;
}

