export interface PngFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UsePngToPdfReturn {
  pngFiles: PngFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadPngFiles: (files: File[]) => Promise<void>;
  removePngFile: (id: string) => void;
  processPngToPdf: () => Promise<void>;
  reset: () => void;
}

