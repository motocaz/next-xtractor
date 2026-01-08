"use client";

import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";
import {
  addImageAsPage,
  createImageToPdfResult,
  type ImageToPdfResult,
} from "@/lib/pdf/image-to-pdf-utils";
import {
  decodeTiffToImageData,
  imageDataToPngBytes,
} from "@/lib/pdf/tiff-utils";

export interface TiffToPdfResult {
  pdfDoc: ImageToPdfResult["pdfDoc"];
  successCount: number;
  failedFiles: string[];
}

export const tiffToPdf = async (files: File[]): Promise<TiffToPdfResult> => {
  if (files.length === 0) {
    throw new Error("Please select at least one TIFF file.");
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const tiffBytes = await readFileAsArrayBuffer(file);
      const imageDataArray = await decodeTiffToImageData(tiffBytes);

      for (const imageData of imageDataArray) {
        try {
          const pngBytes = await imageDataToPngBytes(imageData);
          const pngImage = await pdfDoc.embedPng(pngBytes);
          addImageAsPage(pdfDoc, pngImage);
        } catch (error) {
          console.warn(`Failed to process page from ${file.name}:`, error);
          if (!failedFiles.includes(file.name)) {
            failedFiles.push(file.name);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  return createImageToPdfResult(pdfDoc, failedFiles);
};
