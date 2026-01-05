import type { PDFDocument } from 'pdf-lib';

export type AnnotationType =
  | 'Highlight'
  | 'StrikeOut'
  | 'Underline'
  | 'Ink'
  | 'Polygon'
  | 'Square'
  | 'Circle'
  | 'Line'
  | 'PolyLine'
  | 'Link'
  | 'Text'
  | 'FreeText'
  | 'Popup'
  | 'Squiggly'
  | 'Stamp'
  | 'Caret'
  | 'FileAttachment';

export type PageScope = 'all' | 'specific';

export interface UseRemoveAnnotationsReturn {
  pageScope: PageScope;
  pageRange: string;
  selectedTypes: Set<AnnotationType>;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPageScope: (scope: PageScope) => void;
  setPageRange: (range: string) => void;
  toggleAnnotationType: (type: AnnotationType) => void;
  selectAllTypes: () => void;
  deselectAllTypes: () => void;
  removeAnnotations: () => Promise<void>;
  loadPDF: (file: File) => Promise<void>;
  reset: () => void;
}

