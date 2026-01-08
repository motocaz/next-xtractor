import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PDFDocument } from "pdf-lib";

export type PageSizeKey = "A4" | "Letter" | "Legal" | "A3" | "A5";

export type Orientation = "auto" | "portrait" | "landscape";

export type ScalingMode = "fit" | "fill";

export type OverlapUnits = "pt" | "in" | "mm";

export interface PosterizeOptions {
  rows: number;
  cols: number;
  pageSize: PageSizeKey;
  orientation: Orientation;
  scalingMode: ScalingMode;
  overlap: number;
  overlapUnits: OverlapUnits;
  pageRange: string;
}

export interface UsePosterizePDFReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  currentPageNum: number;
  pdfJsDoc: PDFDocumentProxy | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  rows: number;
  cols: number;
  pageSize: PageSizeKey;
  orientation: Orientation;
  scalingMode: ScalingMode;
  overlap: number;
  overlapUnits: OverlapUnits;
  pageRange: string;

  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setPageSize: (size: PageSizeKey) => void;
  setOrientation: (orientation: Orientation) => void;
  setScalingMode: (mode: ScalingMode) => void;
  setOverlap: (overlap: number) => void;
  setOverlapUnits: (units: OverlapUnits) => void;
  setPageRange: (range: string) => void;

  changePage: (offset: number) => Promise<void>;
  posterize: () => Promise<void>;
  reset: () => void;
}
