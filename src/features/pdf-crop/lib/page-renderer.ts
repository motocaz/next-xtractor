'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';

export const renderPageAsImage = async (
  pdfJsDoc: PDFDocumentProxy,
  pageNum: number,
  scale: number = 2.5
): Promise<string> => {
  const page = await pdfJsDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

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

  return tempCanvas.toDataURL('image/png');
};

export const renderPageToCanvas = async (
  pdfJsDoc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number = 2.5
): Promise<void> => {
  const page = await pdfJsDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  }).promise;
};

export const renderPDFPageAsImage = async (
  file: File,
  pageNum: number,
  scale: number = 2.5
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  return renderPageAsImage(pdfJsDoc, pageNum, scale);
};

