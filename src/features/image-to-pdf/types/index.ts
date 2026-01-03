export interface ImageFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  type: string;
}

export interface UseImageToPdfReturn {
  imageFiles: ImageFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  quality: number;
  loadImageFiles: (files: File[]) => Promise<void>;
  removeImageFile: (id: string) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  setQuality: (quality: number) => void;
  processImageToPdf: () => Promise<void>;
  reset: () => void;
}
