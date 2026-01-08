export type SplitType = "vertical" | "horizontal";

export interface UseSplitInHalfReturn {
  splitType: SplitType;
  pdfFile: File | null;
  pdfDoc: ReturnType<
    typeof import("@/hooks/usePDFProcessor").usePDFProcessor
  >["pdfDoc"];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setSplitType: (type: SplitType) => void;
  loadPDF: (file: File) => Promise<void>;
  processSplit: () => Promise<void>;
  reset: () => void;
}
