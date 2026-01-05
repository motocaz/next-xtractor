import type { UsePDFProcessorReturn } from '@/hooks/usePDFProcessor';

export interface SanitizeOptions {
  flattenForms: boolean;
  removeMetadata: boolean;
  removeAnnotations: boolean;
  removeJavascript: boolean;
  removeEmbeddedFiles: boolean;
  removeLayers: boolean;
  removeLinks: boolean;
  removeStructureTree: boolean;
  removeMarkInfo: boolean;
  removeFonts: boolean;
}

export interface UseSanitizePDFReturn
  extends Omit<
    UsePDFProcessorReturn,
    'processPDF' | 'resetProcessing' | 'setIsProcessing' | 'setError' | 'setSuccess' | 'setLoadingMessage'
  > {
  options: SanitizeOptions;
  setOption: (key: keyof SanitizeOptions, value: boolean) => void;
  sanitizePDF: () => Promise<void>;
  reset: () => void;
}

