'use client';

import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import type { PDFDocument } from 'pdf-lib';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from './file-utils';
import { loadPDFWithPDFJSFromBuffer } from './pdfjs-loader';

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

export const renderPDFPageAsImage = async (
  file: File,
  pageNum: number,
  scale: number = 2.5
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  return renderPageAsImage(pdfJsDoc, pageNum, scale);
};

export const canvasToPngBytes = async (
  canvas: HTMLCanvasElement
): Promise<Uint8Array> => {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve(new Uint8Array(reader.result as ArrayBuffer));
        };
        reader.onerror = () => {
          reject(new Error('Failed to read blob'));
        };
        reader.readAsArrayBuffer(blob);
      },
      'image/png'
    );
  });
};

export const embedCanvasAsPage = async (
  canvas: HTMLCanvasElement,
  pdfDoc: PDFDocument,
  viewport: PageViewport
): Promise<void> => {
  const pngImageBytes = await canvasToPngBytes(canvas);
  const pngImage = await pdfDoc.embedPng(pngImageBytes);
  const newPage = pdfDoc.addPage([viewport.width, viewport.height]);
  newPage.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: viewport.width,
    height: viewport.height,
  });
};

export const processPDFPagesWithCanvas = async (
  file: File,
  scale: number,
  pixelProcessor: (imageData: ImageData) => void,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const newPdfDoc = await PDFLibDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    pixelProcessor(imageData);
    context.putImageData(imageData, 0, 0);

    await embedCanvasAsPage(canvas, newPdfDoc, viewport);
  }

  const newPdfBytes = await newPdfDoc.save();
  return newPdfBytes;
};

