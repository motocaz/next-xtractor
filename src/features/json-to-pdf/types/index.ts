export interface JsonFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface PdfFileData {
  name: string;
  data: ArrayBuffer;
}

export interface JsonToPdfMessage {
  command: 'convert';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}

export interface JsonToPdfSuccessResponse {
  status: 'success';
  pdfFiles: PdfFileData[];
}

export interface JsonToPdfErrorResponse {
  status: 'error';
  message: string;
}

export type JsonToPdfResponse =
  | JsonToPdfSuccessResponse
  | JsonToPdfErrorResponse;

export interface UseJsonToPdfReturn {
  jsonFiles: JsonFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  loadJsonFiles: (files: File[]) => Promise<void>;
  removeJsonFile: (id: string) => void;
  processJsonToPdf: () => Promise<void>;
  reset: () => void;
}

