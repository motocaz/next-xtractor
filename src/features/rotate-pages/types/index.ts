import type { PDFDocument } from 'pdf-lib';

export type PageRotationState = Map<number, number>;

export interface UseRotatePagesReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  totalPages: number;
  isLoadingPDF: boolean;
  pdfError: string | null;
  isProcessing: boolean;
  isLoadingThumbnails: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  thumbnails: Array<{ pageNum: number; imageUrl: string }>;
  rotations: PageRotationState;
  loadPDF: (file: File) => Promise<void>;
  rotatePage: (pageIndex: number, delta: number) => void;
  rotateAll: (delta: number) => void;
  resetRotations: () => void;
  applyRotations: () => Promise<void>;
  reset: () => void;
}

