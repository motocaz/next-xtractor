import type { PDFDocument } from 'pdf-lib';
import type { PageThumbnailData } from '@/lib/pdf/organize-pages-utils';
import type { PageThumbnail } from '@/lib/pdf/thumbnail-renderer';

export type { PageThumbnailData } from '@/lib/pdf/organize-pages-utils';
export type { PageThumbnail } from '@/lib/pdf/thumbnail-renderer';

export interface UsePageOrganizerReturn {
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

export interface UsePageOrganizerWithDuplicateReturn extends UsePageOrganizerReturn {
  duplicatePage: (pageId: string) => void;
}

