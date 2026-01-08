export interface HeicFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseHeicToPdfReturn {
  heicFiles: HeicFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadHeicFiles: (files: File[]) => Promise<void>;
  removeHeicFile: (id: string) => void;
  processHeicToPdf: () => Promise<void>;
  reset: () => void;
}
