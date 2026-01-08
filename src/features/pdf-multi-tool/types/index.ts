"use client";

import type { PDFDocument } from "pdf-lib";

export interface MultiToolPageData {
  id: string;
  pdfIndex: number;
  pageIndex: number;
  originalPageIndex: number;
  rotation: number;
  visualRotation: number;
  pdfDoc: PDFDocument;
  fileName: string;
  thumbnailUrl?: string;
  isBlankPage: boolean;
}

export interface MultiToolSnapshot {
  pages: Array<{
    id: string;
    pdfIndex: number;
    pageIndex: number;
    originalPageIndex: number;
    rotation: number;
    visualRotation: number;
    fileName: string;
    isBlankPage: boolean;
  }>;
  selectedPages: string[];
  splitMarkers: string[];
}

export interface UseMultiToolReturn {
  pages: MultiToolPageData[];
  selectedPages: Set<string>;
  splitMarkers: Set<string>;
  isLoading: boolean;
  isRendering: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  pdfFiles: Array<{
    id: string;
    file: File;
    pdfDoc: PDFDocument;
    pageCount: number;
    fileName: string;
  }>;

  loadPDFs: (files: File[]) => Promise<void>;
  insertPDFAfter: (pageId: string, file: File) => Promise<void>;

  toggleSelectPage: (pageId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  rotatePage: (pageId: string, delta: number) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  addBlankPage: () => void;
  toggleSplitMarker: (pageId: string) => void;
  reorderPages: (activeId: string, overId: string) => void;

  bulkRotate: (delta: number) => void;
  bulkDelete: () => void;
  bulkDuplicate: () => void;
  bulkSplit: () => void;

  downloadSelected: () => Promise<void>;
  downloadAll: () => Promise<void>;

  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  reset: () => void;
}
