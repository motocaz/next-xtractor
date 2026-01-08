export type PageFormat = "a4" | "letter";

export type Orientation = "portrait" | "landscape";

export type MarginSize = "normal" | "narrow" | "wide";

export interface MdToPdfOptions {
  pageFormat: PageFormat;
  orientation: Orientation;
  marginSize: MarginSize;
}

export interface UseMdToPdfReturn {
  markdownContent: string;
  pageFormat: PageFormat;
  orientation: Orientation;
  marginSize: MarginSize;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  setMarkdownContent: (content: string) => void;
  setPageFormat: (format: PageFormat) => void;
  setOrientation: (orientation: Orientation) => void;
  setMarginSize: (size: MarginSize) => void;
  processMdToPdf: () => Promise<void>;
  reset: () => void;
}
