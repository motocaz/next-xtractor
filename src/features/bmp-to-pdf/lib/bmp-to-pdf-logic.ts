'use client';

import { PDFDocument } from 'pdf-lib';

const convertImageToPngBytes = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result || typeof e.target.result !== 'string') {
        reject(new Error('Failed to read file.'));
        return;
      }

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context.'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const pngBlob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, 'image/png')
          );

          if (!pngBlob) {
            reject(new Error('Failed to convert image to PNG.'));
            return;
          }

          const pngBytes = await pngBlob.arrayBuffer();
          resolve(pngBytes);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

export const bmpToPdf = async (files: File[]): Promise<PDFDocument> => {
  if (files.length === 0) {
    throw new Error('Please select at least one BMP file.');
  }

  const pdfDoc = await PDFDocument.create();
  const errors: string[] = [];

  for (const file of files) {
    try {
      const pngBytes = await convertImageToPngBytes(file);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      errors.push(file.name);
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error(
      'No valid images could be processed. Please check your files.'
    );
  }

  if (errors.length > 0) {
    console.warn(
      `Some files could not be processed: ${errors.join(', ')}`
    );
  }

  return pdfDoc;
};

