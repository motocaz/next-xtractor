'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist';

export const renderPage = async (
  pdfDoc: PDFDocumentProxy | null,
  pageNum: number,
  canvas: HTMLCanvasElement,
  container: HTMLElement
): Promise<void> => {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(pageNum);

  const containerWidth = container.clientWidth - 2;
  const viewport = page.getViewport({ scale: 1.0 });
  const scale = containerWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
    canvas: canvas,
  }).promise;
};

