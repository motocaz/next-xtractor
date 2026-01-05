import type { FileInfo } from '@/hooks/useFileInfoLoader';

export type PdfFileInfo = FileInfo;

export interface UsePdfToZipReturn {
  pdfFiles: PdfFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  loadPdfFiles: (files: File[]) => Promise<void>;
  removePdfFile: (id: string) => void;
  processPdfToZip: () => Promise<void>;
  reset: () => void;
}

