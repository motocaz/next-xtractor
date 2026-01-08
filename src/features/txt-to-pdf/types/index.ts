export type FontFamily = "Helvetica" | "TimesRoman" | "Courier";
export type PageSize = "A4" | "Letter";

export interface TxtToPdfOptions {
  fontFamily: FontFamily;
  fontSize: number;
  pageSize: PageSize;
  textColor: string;
}

export interface UseTxtToPdfReturn {
  txtFiles: Array<{ id: string; fileName: string; fileSize: number }>;
  isLoading: boolean;
  fileLoadingMessage: string | null;
  fileError: string | null;
  fileSuccess: string | null;
  loadTxtFiles: (files: File[]) => Promise<void>;
  removeTxtFile: (id: string) => void;

  textInput: string;
  setTextInput: (text: string) => void;

  fontFamily: FontFamily;
  fontSize: number;
  pageSize: PageSize;
  textColor: string;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: number) => void;
  setPageSize: (size: PageSize) => void;
  setTextColor: (color: string) => void;

  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  processTxtToPdf: () => Promise<void>;
  reset: () => void;
}
