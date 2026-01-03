'use client';

import { PDFDocument as PDFLibDocument, rgb, PageSizes } from 'pdf-lib';
import type { PDFDocument } from 'pdf-lib';
import { hexToRgb } from '@/lib/pdf/file-utils';
import type { FixDimensionsOptions } from '../types';

export const fixDimensions = async (
  pdfDoc: PDFDocument,
  options: FixDimensionsOptions
): Promise<PDFDocument> => {
  let targetWidth: number;
  let targetHeight: number;

  if (options.targetSize === 'Custom') {
    const width = Number.parseFloat(options.customWidth || '8.5');
    const height = Number.parseFloat(options.customHeight || '11');

    if (Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
      throw new Error('Invalid custom dimensions. Please enter valid numbers.');
    }

    if (options.customUnits === 'in') {
      targetWidth = width * 72;
      targetHeight = height * 72;
    } else {
      targetWidth = width * (72 / 25.4);
      targetHeight = height * (72 / 25.4);
    }
  } else {
    const pageSize = PageSizes[options.targetSize as keyof typeof PageSizes];
    if (!pageSize) {
      throw new Error(`Invalid page size: ${options.targetSize}`);
    }
    [targetWidth, targetHeight] = pageSize;
  }

  const needsSwap =
    (options.orientation === 'landscape' && targetWidth < targetHeight) ||
    (options.orientation === 'portrait' && targetWidth > targetHeight);

  if (needsSwap) {
    [targetWidth, targetHeight] = [targetHeight, targetWidth];
  }

  const newDoc = await PDFLibDocument.create();
  const backgroundColor = hexToRgb(options.backgroundColor);

  for (const sourcePage of pdfDoc.getPages()) {
    const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize();
    const embeddedPage = await newDoc.embedPage(sourcePage);

    const newPage = newDoc.addPage([targetWidth, targetHeight]);

    newPage.drawRectangle({
      x: 0,
      y: 0,
      width: targetWidth,
      height: targetHeight,
      color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
    });

    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const scale =
      options.scalingMode === 'fit'
        ? Math.min(scaleX, scaleY)
        : Math.max(scaleX, scaleY);

    const scaledWidth = sourceWidth * scale;
    const scaledHeight = sourceHeight * scale;

    const x = (targetWidth - scaledWidth) / 2;
    const y = (targetHeight - scaledHeight) / 2;

    newPage.drawPage(embeddedPage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  return newDoc;
};

