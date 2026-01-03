'use client';

import { readFileAsArrayBuffer, hexToRgb } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { renderPageToCanvas, processPDFPagesWithCanvas } from '@/lib/pdf/canvas-utils';

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

    await renderPageToCanvas(pdf, 1, originalCanvas, PREVIEW_SCALE);

    await renderPageToCanvas(pdf, 1, previewCanvas, PREVIEW_SCALE);

    const previewContext = previewCanvas.getContext('2d');
    if (!previewContext) return;

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
  const pdfBytes = await processPDFPagesWithCanvas(
    file,
    PROCESSING_SCALE,
    (imageData) => {
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
    },
    onProgress
  );
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
};

