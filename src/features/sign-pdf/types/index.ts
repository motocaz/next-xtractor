import type { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export type InteractionMode = 'none' | 'drag' | 'resize';

export type ResizeHandle =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-middle'
  | 'bottom-right';

export interface PlacedSignature {
  id: number;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  aspectRatio: number;
}

export interface SavedSignature {
  image: HTMLImageElement;
  index: number;
}

export interface UseSignPdfReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  pdfJsDoc: PDFDocumentProxy | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  currentPage: number;
  scale: number;
  pageSnapshot: ImageData | null;
  isRendering: boolean;

  savedSignatures: HTMLImageElement[];
  placedSignatures: PlacedSignature[];
  activeSignature: SavedSignature | null;

  interactionMode: InteractionMode;
  draggedSigId: number | null;
  dragOffsetX: number;
  dragOffsetY: number;
  hoveredSigId: number | null;
  resizeHandle: ResizeHandle | null;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;

  loadPDF: (file: File) => Promise<void>;
  renderPage: (pageNum: number) => Promise<void>;
  fitToWidth: () => Promise<void>;
  zoomIn: () => void;
  zoomOut: () => void;
  addSignature: (imageDataUrl: string) => void;
  selectSignature: (index: number) => void;
  placeSignature: (x: number, y: number) => void;
  removeLastSignature: () => void;
  applySignatures: () => Promise<void>;
  reset: () => void;
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  handleMouseMove: (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => void;
  handleDragStart: (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => void;
  handleDragMove: (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => void;
  handleDragEnd: () => void;
  setCurrentPage: (page: number) => void;
}

