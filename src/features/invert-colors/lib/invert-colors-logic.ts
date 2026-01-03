'use client';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';

const PROCESSING_SCALE = 1.5;

export const invertColors = async (
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> => {
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
      data[j] = 255 - data[j];
      data[j + 1] = 255 - data[j + 1];
      data[j + 2] = 255 - data[j + 2];
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
  return newPdfBytes;
};

