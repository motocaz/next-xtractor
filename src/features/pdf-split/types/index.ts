export type SplitMode = 'range' | 'visual' | 'even-odd' | 'all' | 'bookmarks' | 'n-times';

export type EvenOddChoice = 'even' | 'odd';

export interface SplitPDFOptions {
  mode: SplitMode;
  pageRange?: string;
  selectedPages?: Set<number>;
  evenOddChoice?: EvenOddChoice;
  bookmarkLevel?: string;
  nValue?: number;
  downloadAsZip?: boolean;
}

export interface UseSplitPDFReturn {
  splitMode: SplitMode;
  pageRange: string;
  selectedPages: Set<number>;
  evenOddChoice: EvenOddChoice;
  bookmarkLevel: string;
  nValue: number;
  downloadAsZip: boolean;

  pdfFile: File | null;
  pdfDoc: ReturnType<typeof import('@/hooks/usePDFProcessor').usePDFProcessor>['pdfDoc'];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setSplitMode: (mode: SplitMode) => void;
  setPageRange: (range: string) => void;
  setSelectedPages: (pages: Set<number>) => void;
  setEvenOddChoice: (choice: EvenOddChoice) => void;
  setBookmarkLevel: (level: string) => void;
  setNValue: (n: number) => void;
  setDownloadAsZip: (zip: boolean) => void;

  loadPDF: (file: File) => Promise<void>;
  processSplit: () => Promise<void>;
  reset: () => void;
}

