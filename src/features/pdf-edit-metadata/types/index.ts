import type { PDFDocument } from 'pdf-lib';

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

export interface CustomMetadataField {
  key: string;
  value: string;
}

export interface UseEditMetadataReturn {
  metadata: PDFMetadata;
  customFields: CustomMetadataField[];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  updateMetadataField: (field: keyof PDFMetadata, value: string) => void;
  addCustomField: () => void;
  removeCustomField: (index: number) => void;
  updateCustomField: (index: number, key: string, value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processMetadata: () => Promise<void>;
  reset: () => void;
}

