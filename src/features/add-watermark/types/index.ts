import type { PDFDocument } from "pdf-lib";

export type WatermarkType = "text" | "image";

export interface TextWatermarkOptions {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  angle: number;
}

export interface ImageWatermarkOptions {
  type: "image";
  imageFile: File;
  opacity: number;
  angle: number;
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

export interface UseAddWatermarkReturn {
  watermarkType: WatermarkType;
  text: string;
  fontSize: string;
  textColor: string;
  opacityText: string;
  angleText: string;
  imageFile: File | null;
  opacityImage: string;
  angleImage: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setWatermarkType: (type: WatermarkType) => void;
  setText: (value: string) => void;
  setFontSize: (value: string) => void;
  setTextColor: (value: string) => void;
  setOpacityText: (value: string) => void;
  setAngleText: (value: string) => void;
  setImageFile: (file: File | null) => void;
  setOpacityImage: (value: string) => void;
  setAngleImage: (value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processWatermark: () => Promise<void>;
  reset: () => void;
}
