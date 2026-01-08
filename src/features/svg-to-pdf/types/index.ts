export interface SvgFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseSvgToPdfReturn {
  svgFiles: SvgFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadSvgFiles: (files: File[]) => Promise<void>;
  removeSvgFile: (id: string) => void;
  processSvgToPdf: () => Promise<void>;
  reset: () => void;
}
