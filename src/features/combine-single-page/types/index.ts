export interface CombineSinglePageOptions {
  spacing: number;
  backgroundColorHex: string;
  addSeparator: boolean;
}

export interface UseCombineSinglePageReturn {
  pdfFile: File | null;
  spacing: number;
  backgroundColorHex: string;
  addSeparator: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  isLoadingPDF: boolean;
  pdfError: string | null;

  setSpacing: (spacing: number) => void;
  setBackgroundColorHex: (color: string) => void;
  setAddSeparator: (add: boolean) => void;
  loadPDF: (file: File) => Promise<void>;
  processCombine: () => Promise<void>;
  reset: () => void;
}

