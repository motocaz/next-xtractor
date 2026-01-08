export interface UseRemoveMetadataReturn {
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: import("pdf-lib").PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  loadPDF: (file: File) => Promise<void>;
  removeMetadata: () => Promise<void>;
  reset: () => void;
}
