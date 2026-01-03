'use client';

import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { CropData, PageCrops } from '../types';
import { renderPageToCanvas } from './page-renderer';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';

/**
 * Performs a non-destructive crop by updating the page's crop box.
 * This preserves vector graphics and text.
 * 
 * @param pdfDoc - PDF document from pdf-lib
 * @param cropData - Map of page numbers to crop data (percentages)
 * @returns Modified PDF document
 */
export const performMetadataCrop = async (
  pdfDoc: PDFDocument,
  cropData: PageCrops
): Promise<PDFDocument> => {
  const pages = pdfDoc.getPages();

  for (const pageNumStr in cropData) {
    const pageNum = Number.parseInt(pageNumStr, 10);
    if (pageNum < 1 || pageNum > pages.length) {
      continue;
    }

    const page = pages[pageNum - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const rotation = page.getRotation().angle;
    const crop = cropData[pageNum];

    // Convert percentages to actual dimensions
    const visualPdfWidth = pageWidth * crop.width;
    const visualPdfHeight = pageHeight * crop.height;
    const visualPdfX = pageWidth * crop.x;
    const visualPdfY = pageHeight * crop.y;

    // Calculate crop box coordinates based on page rotation
    let finalX: number;
    let finalY: number;
    let finalWidth: number;
    let finalHeight: number;

    switch (rotation) {
      case 90:
        finalX = visualPdfY;
        finalY = pageWidth - visualPdfX - visualPdfWidth;
        finalWidth = visualPdfHeight;
        finalHeight = visualPdfWidth;
        break;
      case 180:
        finalX = pageWidth - visualPdfX - visualPdfWidth;
        finalY = pageHeight - visualPdfY - visualPdfHeight;
        finalWidth = visualPdfWidth;
        finalHeight = visualPdfHeight;
        break;
      case 270:
        finalX = pageHeight - visualPdfY - visualPdfHeight;
        finalY = visualPdfX;
        finalWidth = visualPdfHeight;
        finalHeight = visualPdfWidth;
        break;
      default:
        // 0 degrees or no rotation
        finalX = visualPdfX;
        finalY = pageHeight - visualPdfY - visualPdfHeight;
        finalWidth = visualPdfWidth;
        finalHeight = visualPdfHeight;
        break;
    }

    page.setCropBox(finalX, finalY, finalWidth, finalHeight);
  }

  return pdfDoc;
};

/**
 * Performs a destructive crop by flattening the selected area to an image.
 * This converts the cropped area to a raster image, losing vector graphics.
 * 
 * @param pdfJsDoc - PDF document from PDF.js (for rendering)
 * @param cropData - Map of page numbers to crop data (percentages)
 * @param originalPdfBytes - Original PDF bytes (for copying uncropped pages)
 * @param onProgress - Optional progress callback
 * @returns New PDF document with cropped pages
 */
export const performFlatteningCrop = async (
  pdfJsDoc: PDFDocumentProxy,
  cropData: PageCrops,
  originalPdfBytes: ArrayBuffer,
  onProgress?: (message: string) => void
): Promise<PDFDocument> => {
  const newPdfDoc = await PDFDocument.create();
  const sourcePdfDocForCopying = await PDFDocument.load(originalPdfBytes, {
    ignoreEncryption: true,
  });
  const totalPages = pdfJsDoc.numPages;

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    onProgress?.(`Processing page ${pageNum} of ${totalPages}...`);

    if (cropData[pageNum]) {
      // Render the page to a canvas
      const page = await pdfJsDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.5 });

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        throw new Error('Failed to get canvas context');
      }

      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;

      await page.render({
        canvasContext: tempCtx,
        viewport: viewport,
        canvas: tempCanvas,
      }).promise;

      // Extract the cropped area
      const crop = cropData[pageNum];
      const finalWidth = tempCanvas.width * crop.width;
      const finalHeight = tempCanvas.height * crop.height;

      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) {
        throw new Error('Failed to get final canvas context');
      }

      finalCanvas.width = finalWidth;
      finalCanvas.height = finalHeight;

      // Draw the cropped portion
      finalCtx.drawImage(
        tempCanvas,
        tempCanvas.width * crop.x,
        tempCanvas.height * crop.y,
        finalWidth,
        finalHeight,
        0,
        0,
        finalWidth,
        finalHeight
      );

      // Convert to PNG and embed in PDF
      const pngBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
        finalCanvas.toBlob(
          (blob) => {
            if (blob) {
              blob.arrayBuffer().then(resolve).catch(reject);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/png'
        );
      });

      const embeddedImage = await newPdfDoc.embedPng(pngBytes);
      const newPage = newPdfDoc.addPage([finalWidth, finalHeight]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: finalWidth,
        height: finalHeight,
      });
    } else {
      // Copy the page without modification
      const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDocForCopying, [i]);
      newPdfDoc.addPage(copiedPage);
    }
  }

  return newPdfDoc;
};




