export interface WebpFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseWebpToPdfReturn {
  webpFiles: WebpFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadWebpFiles: (files: File[]) => Promise<void>;
  removeWebpFile: (id: string) => void;
  processWebpToPdf: () => Promise<void>;
  reset: () => void;
}
