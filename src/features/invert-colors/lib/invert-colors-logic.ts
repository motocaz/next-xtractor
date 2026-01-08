"use client";

import { processPDFPagesWithCanvas } from "@/lib/pdf/canvas-utils";

const PROCESSING_SCALE = 1.5;

export const invertColors = async (
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<Uint8Array> => {
  return processPDFPagesWithCanvas(
    file,
    PROCESSING_SCALE,
    (imageData) => {
      const data = imageData.data;
      for (let j = 0; j < data.length; j += 4) {
        data[j] = 255 - data[j];
        data[j + 1] = 255 - data[j + 1];
        data[j + 2] = 255 - data[j + 2];
      }
    },
    onProgress,
  );
};
