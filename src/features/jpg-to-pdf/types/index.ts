export interface JpgFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseJpgToPdfReturn {
  jpgFiles: JpgFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadJpgFiles: (files: File[]) => Promise<void>;
  removeJpgFile: (id: string) => void;
  processJpgToPdf: () => Promise<void>;
  reset: () => void;
}

