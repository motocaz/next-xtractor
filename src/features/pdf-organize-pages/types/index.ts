import type { PDFDocument } from 'pdf-lib';
import type { PageThumbnailData, PageThumbnail } from '@/types/pdf-organize';

export type { PageThumbnailData, PageThumbnail };

export interface UseOrganizePagesReturn {
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
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  processAndSave: () => Promise<void>;
  reset: () => void;
}
