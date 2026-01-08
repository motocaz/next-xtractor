"use client";

import type { PDFPageProxy } from "pdfjs-dist";

export const isPageBlank = async (
  page: PDFPageProxy,
  threshold: number,
  scale: number = 0.2,
): Promise<boolean> => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = data.length / 4;
  let nonWhitePixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) {
      nonWhitePixels++;
    }
  }

  const blankness = 1 - nonWhitePixels / totalPixels;
  return blankness >= threshold / 100;
};
