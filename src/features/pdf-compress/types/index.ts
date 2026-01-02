export type CompressionLevel = 'balanced' | 'high-quality' | 'small-size' | 'extreme';

export type CompressionAlgorithm = 'vector' | 'photon' | 'automatic';

export interface SmartCompressionSettings {
  quality: number;
  threshold: number;
  maxWidth: number;
  maxHeight: number;
  skipSize: number;
  removeMetadata?: boolean;
  scaleFactor?: number;
  minDimension?: number;
  smoothing?: boolean;
  smoothingQuality?: 'low' | 'medium' | 'high';
  grayscale?: boolean;
  contrast?: number;
  brightness?: number;
  tryWebP?: boolean;
  useObjectStreams?: boolean;
  objectsPerTick?: number;
}

export interface LegacyCompressionSettings {
  scale: number;
  quality: number;
}

export interface CompressionSettings {
  smart: SmartCompressionSettings;
  legacy: LegacyCompressionSettings;
}

export interface CompressionResult {
  bytes: Uint8Array;
  method: string;
  originalSize: number;
  compressedSize: number;
  savings: number;
  savingsPercent: number;
}

export interface PDFFileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseCompressPDFReturn {
  pdfFiles: PDFFileInfo[];
  compressionLevel: CompressionLevel;
  compressionAlgorithm: CompressionAlgorithm;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  compressionStats: {
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
    method: string;
  } | null;
  loadPDFFiles: (files: File[]) => Promise<void>;
  removePDFFile: (id: string) => void;
  setCompressionLevel: (level: CompressionLevel) => void;
  setCompressionAlgorithm: (algorithm: CompressionAlgorithm) => void;
  processCompression: () => Promise<void>;
  reset: () => void;
}

