import type { PDFDocument } from 'pdf-lib';

export interface AttachmentFile {
  file: File;
  name: string;
  size: number;
}

export interface AddAttachmentsState {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  attachments: AttachmentFile[];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
}


