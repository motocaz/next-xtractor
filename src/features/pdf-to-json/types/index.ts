import type { FileInfo } from '@/hooks/useFileInfoLoader';

export type PdfFileInfo = FileInfo;

export interface JsonFileData {
  name: string;
  data: ArrayBuffer;
}

export interface PdfToJsonMessage {
  command: 'convert';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}

export interface PdfToJsonSuccessResponse {
  status: 'success';
  jsonFiles: JsonFileData[];
}

export interface PdfToJsonErrorResponse {
  status: 'error';
  message: string;
}

export type PdfToJsonResponse =
  | PdfToJsonSuccessResponse
  | PdfToJsonErrorResponse;

export interface UsePdfToJsonReturn {
  pdfFiles: PdfFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  loadPdfFiles: (files: File[]) => Promise<void>;
  removePdfFile: (id: string) => void;
  processPdfToJson: () => Promise<void>;
  reset: () => void;
}

