'use client';

import { useState, useCallback, useMemo } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { getStandardPageName } from '@/lib/pdf/page-dimensions-utils';
import type {
  UsePageDimensionsReturn,
  PageDimensionData,
  DimensionUnit,
} from '../types';

export const usePageDimensions = (): UsePageDimensionsReturn => {
  const [selectedUnit, setSelectedUnit] = useState<DimensionUnit>('pt');

  const {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    resetPDF,
  } = usePDFProcessor();

  const pageData = useMemo<PageDimensionData[]>(() => {
    if (!pdfDoc) {
      return [];
    }

    const pages = pdfDoc.getPages();
    const analyzedData: PageDimensionData[] = [];

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const orientation = width > height ? 'Landscape' : 'Portrait';
      const standardSize = getStandardPageName(width, height);

      analyzedData.push({
        pageNum: index + 1,
        width,
        height,
        orientation,
        standardSize,
      });
    });

    return analyzedData;
  }, [pdfDoc]);

  const handleSetSelectedUnit = useCallback((unit: DimensionUnit) => {
    setSelectedUnit(unit);
  }, []);

  const reset = useCallback(() => {
    setSelectedUnit('pt');
    resetPDF();
  }, [resetPDF]);

  return {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    pageData,
    selectedUnit,
    loadPDF,
    setSelectedUnit: handleSetSelectedUnit,
    reset,
  };
};

