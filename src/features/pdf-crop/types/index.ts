/**
 * Crop data for a single page, stored as percentages (0-1)
 * to be resolution-independent
 */
export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crop mode: metadata (non-destructive) or flattening (destructive)
 */
export type CropMode = 'metadata' | 'flattening';

/**
 * Map of page numbers to their crop data
 */
export type PageCrops = Record<number, CropData>;

/**
 * Return type for useCropPDF hook
 */
export interface UseCropPDFReturn {
  // PDF loading states (from usePDFProcessor)
  pdfFile: File | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;
  totalPages: number;

  // Processing states (from usePDFProcessor)
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  // Crop-specific states
  currentPageNum: number;
  pageCrops: PageCrops;
  cropMode: CropMode;
  applyToAll: boolean;
  currentPageImageUrl: string | null;

  // Crop-specific actions
  setCropMode: (mode: CropMode) => void;
  setApplyToAll: (apply: boolean) => void;
  changePage: (offset: number) => Promise<void>;
  saveCurrentCrop: (cropData: CropData) => void;
  applyCrop: (currentPageCrop?: CropData) => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

