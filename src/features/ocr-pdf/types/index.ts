export type WhitelistPreset =
  | 'alphanumeric'
  | 'numbers-currency'
  | 'letters-only'
  | 'numbers-only'
  | 'invoice'
  | 'forms'
  | 'custom'
  | '';

export type OCRResolution = '2.0' | '3.0' | '4.0';

export interface OCROptions {
  selectedLanguages: string[];
  resolution: OCRResolution;
  binarize: boolean;
  whitelist: string;
  whitelistPreset: WhitelistPreset;
}

export interface OCRProgress {
  status: string;
  progress: number;
  currentPage?: number;
  totalPages?: number;
}

export interface HOCRWord {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

export interface UseOCRReturn {
  pdfFile: File | null;
  pdfDoc: ReturnType<typeof import('@/hooks/usePDFProcessor').usePDFProcessor>['pdfDoc'];
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;

  selectedLanguages: string[];
  resolution: OCRResolution;
  binarize: boolean;
  whitelist: string;
  whitelistPreset: WhitelistPreset;
  extractedText: string;
  searchablePdfBytes: Uint8Array | null;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  progressLog: string[];

  setSelectedLanguages: (languages: string[]) => void;
  setResolution: (resolution: OCRResolution) => void;
  setBinarize: (binarize: boolean) => void;
  setWhitelist: (whitelist: string) => void;
  setWhitelistPreset: (preset: WhitelistPreset) => void;

  runOCR: () => Promise<void>;
  copyText: () => Promise<void>;
  downloadText: () => void;
  downloadSearchablePDF: () => void;
  reset: () => void;
}

