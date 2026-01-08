"use client";

import { pdfToImageZip } from "@/lib/pdf/pdf-to-image-utils";
import { canvasToTiffBlob } from "@/lib/pdf/canvas-utils";

export const pdfToTiff = async (
  pdfFile: File,
  scale: number,
  onProgress?: (currentPage: number, totalPages: number) => void,
): Promise<Blob> => {
  return pdfToImageZip(pdfFile, {
    scale,
    fileExtension: "tiff",
    converter: canvasToTiffBlob,
    converterType: "canvas",
    onProgress,
  });
};
