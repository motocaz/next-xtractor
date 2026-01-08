import type { PDFDocument } from "pdf-lib";

export type FormFieldValue = string | boolean | string[];

export type FormFieldType =
  | "text"
  | "checkbox"
  | "radio"
  | "dropdown"
  | "option-list"
  | "unsupported";

export interface FormField {
  name: string;
  type: FormFieldType;
  required: boolean;
  value: FormFieldValue;
  options?: string[];
  label: string;
}

export interface UseFormFillerReturn {
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  formFields: FormField[];
  fieldValues: Record<string, FormFieldValue>;
  currentPage: number;
  zoom: number;
  isRendering: boolean;

  loadPDF: (file: File) => Promise<void>;
  updateFieldValue: (name: string, value: FormFieldValue) => void;
  changePage: (offset: number) => void;
  setZoom: (factor: number) => void;
  processAndDownload: () => Promise<void>;
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  reset: () => void;
}
