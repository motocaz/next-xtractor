export interface AttachmentData {
  name: string;
  data: ArrayBuffer;
}

export interface ExtractAttachmentsMessage {
  command: 'extract-attachments';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}

export interface ExtractAttachmentSuccessResponse {
  status: 'success';
  attachments: AttachmentData[];
}

export interface ExtractAttachmentErrorResponse {
  status: 'error';
  message: string;
}

export type ExtractAttachmentResponse =
  | ExtractAttachmentSuccessResponse
  | ExtractAttachmentErrorResponse;

export interface UseExtractAttachmentsReturn {
  pdfFiles: File[];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  loadPDFs: (files: File[]) => void;
  removePDF: (index: number) => void;
  extractAttachments: () => Promise<void>;
  reset: () => void;
}

