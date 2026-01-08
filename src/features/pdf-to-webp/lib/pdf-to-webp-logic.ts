"use client";

import { pdfToImageZip } from "@/lib/pdf/pdf-to-image-utils";
import { canvasToWebpBlob } from "@/lib/pdf/canvas-utils";

const PROCESSING_SCALE = 2;

export const pdfToWebp = async (
  pdfFile: File,
  quality: number,
  onProgress?: (currentPage: number, totalPages: number) => void,
): Promise<Blob> => {
  return pdfToImageZip(pdfFile, {
    scale: PROCESSING_SCALE,
    fileExtension: "webp",
    converter: canvasToWebpBlob,
    converterType: "canvas",
    converterOptions: quality,
    onProgress,
  });
};
