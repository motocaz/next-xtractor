"use client";

import { processPDFPagesWithCanvas } from "@/lib/pdf/canvas-utils";

const PROCESSING_SCALE = 1.5;

export const pdfToGreyscale = async (
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> => {
  return processPDFPagesWithCanvas(
    file,
    PROCESSING_SCALE,
    (imageData) => {
      const data = imageData.data;
      for (let j = 0; j < data.length; j += 4) {
        const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
        data[j] = avg;
        data[j + 1] = avg;
        data[j + 2] = avg;
      }
    },
    onProgress
  );
};
