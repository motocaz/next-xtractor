import type { PDFDocumentProxy } from 'pdfjs-dist';

export type ViewMode = 'overlay' | 'side-by-side';

export interface UseComparePDFsReturn {
  pdfDoc1: PDFDocumentProxy | null;
  pdfDoc2: PDFDocumentProxy | null;
  pdfFile1: File | null;
  pdfFile2: File | null;

  isLoading1: boolean;
  isLoading2: boolean;
  error1: string | null;
  error2: string | null;

  currentPage: number;
  viewMode: ViewMode;
  opacity: number;
  isSyncScroll: boolean;

  loadPDF1: (file: File) => Promise<void>;
  loadPDF2: (file: File) => Promise<void>;
  resetPDF1: () => void;
  resetPDF2: () => void;
  setViewMode: (mode: ViewMode) => void;
  setOpacity: (opacity: number) => void;
  setIsSyncScroll: (sync: boolean) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;

  renderPage: (
    pdfDoc: PDFDocumentProxy | null,
    pageNum: number,
    canvas: HTMLCanvasElement,
    container: HTMLElement
  ) => Promise<void>;
}

