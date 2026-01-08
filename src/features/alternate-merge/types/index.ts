import type { PDFFileInfo } from "@/hooks/useMultiPDFLoader";

export interface UseAlternateMergeReturn {
  pdfFiles: PDFFileInfo[];
  isLoading: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  warning: string | null;
  success: string | null;

  loadPDFs: (files: File[]) => Promise<void>;
  removePDF: (id: string) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  processAlternateMerge: () => Promise<void>;
  reset: () => void;
}
