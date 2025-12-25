import type { PDFDocument } from 'pdf-lib';

export interface PDFFileInfo {
  id: string;
  file: File;
  pdfDoc: PDFDocument;
  pageCount: number;
  fileName: string;
}

export interface UseAlternateMergeReturn {
  pdfFiles: PDFFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  loadPDFs: (files: File[]) => Promise<void>;
  removePDF: (id: string) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  processAlternateMerge: () => Promise<void>;
  reset: () => void;
}

