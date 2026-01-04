export type MergeMode = 'file' | 'page';

import type { PDFFileInfo } from '@/hooks/useMultiPDFLoader';

export interface MergePageThumbnailData {
  id: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  fileId: string;
}

export interface PageThumbnail {
  pageId: string;
  imageUrl: string;
}

export interface UseMergePDFReturn {
  pdfFiles: PDFFileInfo[];
  activeMode: MergeMode;
  pageThumbnails: MergePageThumbnailData[];
  thumbnailImages: Map<string, string>;
  
  isLoading: boolean;
  isRenderingThumbnails: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  
  pageRanges: Map<string, string>;
  
  loadPDFs: (files: File[]) => Promise<void>;
  removePDF: (id: string) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  setActiveMode: (mode: MergeMode) => Promise<void>;
  setPageRange: (fileId: string, range: string) => void;
  renderPageThumbnails: () => Promise<void>;
  reorderPages: (activeId: string, overId: string) => void;
  processMerge: () => Promise<void>;
  reset: () => void;
}

