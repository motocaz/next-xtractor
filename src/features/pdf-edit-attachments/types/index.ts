export interface AttachmentInfo {
  index: number;
  name: string;
  page: number;
  data: Uint8Array;
}

import type { PDFDocument } from "pdf-lib";

export interface UseEditAttachmentsReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  attachments: AttachmentInfo[];
  attachmentsToRemove: Set<number>;
  isLoadingAttachments: boolean;

  loadPDF: (file: File) => Promise<void>;
  loadAttachments: () => Promise<void>;
  toggleAttachmentRemoval: (index: number) => void;
  toggleAllAttachments: () => void;
  processAndSave: () => Promise<void>;
  reset: () => void;
}

export interface WorkerGetAttachmentsMessage {
  command: "get-attachments";
  fileBuffer: ArrayBuffer;
  fileName: string;
}

export interface WorkerEditAttachmentsMessage {
  command: "edit-attachments";
  fileBuffer: ArrayBuffer;
  fileName: string;
  attachmentsToRemove: number[];
}

export interface WorkerSuccessResponse {
  status: "success";
  attachments?: AttachmentInfo[];
  modifiedPDF?: ArrayBuffer;
  fileName: string;
}

export interface WorkerErrorResponse {
  status: "error";
  message: string;
}

export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;
