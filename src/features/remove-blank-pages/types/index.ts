import type { PDFDocument } from "pdf-lib";
import type { PDFPageProxy } from "pdfjs-dist";

export interface PageAnalysisData {
  pageNum: number;
  pageRef: PDFPageProxy;
  isBlank: boolean;
  thumbnailUrl?: string;
}

export interface AnalysisResult {
  pagesToRemove: number[];
  analysisData: PageAnalysisData[];
  message: string;
}

export interface UseRemoveBlankPagesReturn {
  sensitivity: number;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setSensitivity: (value: number) => void;
  analyzePages: () => Promise<void>;
  removeBlankPages: () => Promise<void>;
  loadPDF: (file: File) => Promise<void>;
  reset: () => void;
}
