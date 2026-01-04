import type { PDFDocument } from 'pdf-lib';

export type PagesPerSheet = 2 | 4 | 9 | 16;

export type PageSize = 'Letter' | 'Legal' | 'Tabloid' | 'A4' | 'A3';

export type Orientation = 'auto' | 'portrait' | 'landscape';

export type GridDimensions = [number, number];

export interface NUpOptions {
  pagesPerSheet: PagesPerSheet;
  pageSize: PageSize;
  orientation: Orientation;
  useMargins: boolean;
  addBorder: boolean;
  borderColor: string;
}

export interface UseNUpReturn {
  pagesPerSheet: PagesPerSheet;
  pageSize: PageSize;
  orientation: Orientation;
  useMargins: boolean;
  addBorder: boolean;
  borderColor: string;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPagesPerSheet: (value: PagesPerSheet) => void;
  setPageSize: (value: PageSize) => void;
  setOrientation: (value: Orientation) => void;
  setUseMargins: (value: boolean) => void;
  setAddBorder: (value: boolean) => void;
  setBorderColor: (value: string) => void;

  loadPDF: (file: File) => Promise<void>;
  processNUp: () => Promise<void>;
  reset: () => void;
}

