'use client';

import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';
import { readFileAsArrayBuffer, hexToRgb } from '@/lib/pdf/file-utils';

export const combineToSinglePage = async (
  file: File,
  spacing: number,
  backgroundColorHex: string,
  addSeparator: boolean,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const sourceDoc = await PDFLibDocument.load(arrayBuffer);
  const newDoc = await PDFLibDocument.create();
  const sourcePages = sourceDoc.getPages();

  let maxWidth = 0;
  let totalHeight = 0;
  sourcePages.forEach((page) => {
    const { width, height } = page.getSize();
    if (width > maxWidth) maxWidth = width;
    totalHeight += height;
  });
  totalHeight += Math.max(0, sourcePages.length - 1) * spacing;

  const newPage = newDoc.addPage([maxWidth, totalHeight]);

  if (backgroundColorHex.toUpperCase() !== '#FFFFFF') {
    const backgroundColor = hexToRgb(backgroundColorHex);
    newPage.drawRectangle({
      x: 0,
      y: 0,
      width: maxWidth,
      height: totalHeight,
      color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
    });
  }

  let currentY = totalHeight;
  for (let i = 0; i < sourcePages.length; i++) {
    onProgress?.(i + 1, sourcePages.length);
    const sourcePage = sourcePages[i];
    const { width, height } = sourcePage.getSize();

    currentY -= height;
    const x = (maxWidth - width) / 2;

    try {
      const embeddedPage = await newDoc.embedPage(sourcePage);
      newPage.drawPage(embeddedPage, { x, y: currentY, width, height });
    } catch {
      if (backgroundColorHex.toUpperCase() === '#FFFFFF') {
        newPage.drawRectangle({
          x,
          y: currentY,
          width,
          height,
          color: rgb(1, 1, 1),
        });
      }
    }

    if (addSeparator && i < sourcePages.length - 1) {
      const lineY = currentY - spacing / 2;
      newPage.drawLine({
        start: { x: 0, y: lineY },
        end: { x: maxWidth, y: lineY },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    }

    currentY -= spacing;
  }

  const newPdfBytes = await newDoc.save();
  return new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' });
};

