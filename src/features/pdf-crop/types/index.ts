export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropMode = "metadata" | "flattening";

export type PageCrops = Record<number, CropData>;

export interface UseCropPDFReturn {
  pdfFile: File | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;
  totalPages: number;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  currentPageNum: number;
  pageCrops: PageCrops;
  cropMode: CropMode;
  applyToAll: boolean;
  currentPageImageUrl: string | null;

  setCropMode: (mode: CropMode) => void;
  setApplyToAll: (apply: boolean) => void;
  changePage: (offset: number) => Promise<void>;
  saveCurrentCrop: (cropData: CropData) => void;
  applyCrop: (currentPageCrop?: CropData) => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}
