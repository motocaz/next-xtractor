export interface BmpFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseBmpToPdfReturn {
  bmpFiles: BmpFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadBmpFiles: (files: File[]) => Promise<void>;
  removeBmpFile: (id: string) => void;
  processBmpToPdf: () => Promise<void>;
  reset: () => void;
}

