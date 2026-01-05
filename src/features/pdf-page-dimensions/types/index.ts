import type { PDFDocument } from 'pdf-lib';

export type DimensionUnit = 'pt' | 'in' | 'mm' | 'px';

export interface PageDimensionData {
  pageNum: number;
  width: number; 
  height: number;
  orientation: 'Portrait' | 'Landscape';
  standardSize: string;
}

export interface UsePageDimensionsReturn {
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  pageData: PageDimensionData[];
  selectedUnit: DimensionUnit;

  loadPDF: (file: File) => Promise<void>;
  setSelectedUnit: (unit: DimensionUnit) => void;
  reset: () => void;
}

