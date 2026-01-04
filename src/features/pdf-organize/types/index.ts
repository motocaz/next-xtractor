import type { PDFDocument } from 'pdf-lib';

export interface PageThumbnailData {
  id: string;
  originalPageIndex: number;
  displayNumber: number;
}

export interface PageThumbnail {
  pageNum: number;
  imageUrl: string;
}

export interface UseOrganizeReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  pages: PageThumbnailData[];
  thumbnails: PageThumbnail[];
  isLoadingThumbnails: boolean;

  loadPDF: (file: File) => Promise<void>;
  reorderPages: (activeId: string, overId: string) => void;
  deletePage: (pageId: string) => void;
  processAndSave: () => Promise<void>;
  reset: () => void;
}

