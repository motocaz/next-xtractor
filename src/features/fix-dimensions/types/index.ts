import type { PDFDocument } from "pdf-lib";

export interface FixDimensionsOptions {
  targetSize: string;
  orientation: "portrait" | "landscape";
  scalingMode: "fit" | "fill";
  backgroundColor: string;
  customWidth?: string;
  customHeight?: string;
  customUnits?: "in" | "mm";
}

export interface UseFixDimensionsReturn {
  targetSize: string;
  orientation: "portrait" | "landscape";
  scalingMode: "fit" | "fill";
  backgroundColor: string;
  customWidth: string;
  customHeight: string;
  customUnits: "in" | "mm";
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setTargetSize: (value: string) => void;
  setOrientation: (value: "portrait" | "landscape") => void;
  setScalingMode: (value: "fit" | "fill") => void;
  setBackgroundColor: (value: string) => void;
  setCustomWidth: (value: string) => void;
  setCustomHeight: (value: string) => void;
  setCustomUnits: (value: "in" | "mm") => void;
  loadPDF: (file: File) => Promise<void>;
  processFixDimensions: () => Promise<void>;
  reset: () => void;
}
