export interface RedactionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PageRedactions = Record<number, RedactionRect[]>;

import type { UsePDFProcessorReturn } from '@/hooks/usePDFProcessor';

export interface UseRedactPDFReturn {
  pdfFile: File | null;
  pdfDoc: UsePDFProcessorReturn['pdfDoc'];
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;
  
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  
  currentPageNum: number;
  pageRedactions: PageRedactions;
  currentPageImageUrl: string | null;
  canvasScale: number;
  
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;
  changePage: (offset: number) => Promise<void>;
  addRedaction: (rect: RedactionRect) => void;
  removeRedaction: (pageNum: number, index: number) => void;
  clearPageRedactions: (pageNum: number) => void;
  clearAllRedactions: () => void;
  applyRedactions: () => Promise<void>;
  setError: (error: string | null) => void;
}

