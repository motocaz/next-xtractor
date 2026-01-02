'use client';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { readFileAsArrayBuffer, hexToRgb } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';

const DARKNESS_THRESHOLD = 120;
const PREVIEW_SCALE = 0.8;
const PROCESSING_SCALE = 2.0;

export const updateTextColorPreview = async (
  file: File,
  colorHex: string,
  originalCanvas: HTMLCanvasElement,
  previewCanvas: HTMLCanvasElement
): Promise<void> => {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
    const page = await pdf.getPage(1); // Preview first page
    const viewport = page.getViewport({ scale: PREVIEW_SCALE });

    originalCanvas.width = viewport.width;
    originalCanvas.height = viewport.height;
    const originalContext = originalCanvas.getContext('2d');
    if (!originalContext) return;

    await page.render({
      canvasContext: originalContext,
      viewport,
      canvas: originalCanvas,
    }).promise;

    previewCanvas.width = viewport.width;
    previewCanvas.height = viewport.height;
    const previewContext = previewCanvas.getContext('2d');
    if (!previewContext) return;

    await page.render({
      canvasContext: previewContext,
      viewport,
      canvas: previewCanvas,
    }).promise;

    const imageData = previewContext.getImageData(
      0,
      0,
      previewCanvas.width,
      previewCanvas.height
    );
    const data = imageData.data;
    const { r, g, b } = hexToRgb(colorHex);

    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] < DARKNESS_THRESHOLD &&
        data[i + 1] < DARKNESS_THRESHOLD &&
        data[i + 2] < DARKNESS_THRESHOLD
      ) {
        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = b * 255;
      }
    }
    previewContext.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error updating preview:', error);
    throw error;
  }
};

export const changeTextColor = async (
  file: File,
  colorHex: string,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> => {
  const { r, g, b } = hexToRgb(colorHex);
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const newPdfDoc = await PDFLibDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PROCESSING_SCALE });

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
    const data = imageData.data;

    for (let j = 0; j < data.length; j += 4) {
      if (
        data[j] < DARKNESS_THRESHOLD &&
        data[j + 1] < DARKNESS_THRESHOLD &&
        data[j + 2] < DARKNESS_THRESHOLD
      ) {
        data[j] = r * 255;
        data[j + 1] = g * 255;
        data[j + 2] = b * 255;
      }
    }
    context.putImageData(imageData, 0, 0);

    const pngImageBytes = await new Promise<Uint8Array>((resolve, reject) => {
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

    const pngImage = await newPdfDoc.embedPng(pngImageBytes);
    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  const newPdfBytes = await newPdfDoc.save();
  return new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' });
};

