import type { PDFDocument } from "pdf-lib";

export interface TiffFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseTiffToPdfReturn {
  tiffFiles: TiffFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  failedFiles: string[];
  loadTiffFiles: (files: File[]) => Promise<void>;
  removeTiffFile: (id: string) => void;
  processTiffToPdf: () => Promise<void>;
  reset: () => void;
}

export interface TiffToPdfResult {
  pdfDoc: PDFDocument;
  successCount: number;
  failedFiles: string[];
}
