import type { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface BookmarkNode {
  id: string;
  title: string;
  page: number;
  children: BookmarkNode[];
  color: string | null;
  style: string | null;
  destX: number | null;
  destY: number | null;
  zoom: string | null;
}

export interface BookmarkToolState {
  pdfLibDoc: PDFDocument | null;
  pdfJsDoc: PDFDocumentProxy | null;
  currentPage: number;
  originalFileName: string;
  bookmarkTree: BookmarkNode[];
  searchQuery: string;
  batchMode: boolean;
  selectedBookmarks: Set<string>;
  collapsedNodes: Set<string>;
  isPickingDestination: boolean;
  currentZoom: number;
}

export interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  viewport: { width: number; height: number } | null;
  isLoading: boolean;
}

export interface DestinationPickerState {
  isActive: boolean;
  currentCallback: ((page: number, x: number, y: number) => void) | null;
  markerPosition: { x: number; y: number } | null;
}

