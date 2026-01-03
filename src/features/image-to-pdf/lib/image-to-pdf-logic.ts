"use client";

import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";
import {
  convertImageToPngBytes,
  convertHeicToPngBytes,
} from "@/lib/pdf/image-to-pdf-utils";

export interface ImageToPdfResult {
  pdfDoc: PDFDocument;
  successCount: number;
  failedFiles: string[];
}

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/tif",
  "image/svg+xml",
]);
const ACCEPTED_EXTENSIONS = [".heic", ".heif"];

export const detectImageTypes = (files: File[]): Map<string, File[]> => {
  const filesByType = new Map<string, File[]>();

  for (const file of files) {
    let type = file.type || "";

    if (
      !type ||
      (!ACCEPTED_TYPES.has(type) &&
        ACCEPTED_EXTENSIONS.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        ))
    ) {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".heic") || lowerName.endsWith(".heif")) {
        type = "image/heic";
      }
    }

    if (!filesByType.has(type)) {
      filesByType.set(type, []);
    }
    filesByType.get(type)!.push(file);
  }

  return filesByType;
};

export const convertImageToJpegBytes = async (
  file: File,
  quality: number
): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const imageBitmapPromise = createImageBitmap(file);

    imageBitmapPromise
      .then(async (imageBitmap) => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = imageBitmap.width;
          canvas.height = imageBitmap.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context."));
            return;
          }

          ctx.drawImage(imageBitmap, 0, 0);
          imageBitmap.close();

          const jpegBlob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/jpeg", quality)
          );

          if (!jpegBlob) {
            reject(new Error("Failed to convert image to JPEG."));
            return;
          }

          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
          resolve(jpegBytes);
        } catch (error) {
          reject(error);
        }
      })
      .catch((error) => {
        reject(
          new Error(
            `Failed to create image bitmap: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      });
  });
};

export const convertSingleTypeImages = async (
  files: File[],
  type: string
): Promise<ImageToPdfResult> => {
  if (files.length === 0) {
    throw new Error("Please select at least one image file.");
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      if (type === "image/jpeg" || type === "image/jpg") {
        const jpgBytes = await readFileAsArrayBuffer(file);
        try {
          const jpgImage = await pdfDoc.embedJpg(new Uint8Array(jpgBytes));
          const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
          page.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: jpgImage.width,
            height: jpgImage.height,
          });
        } catch {
          console.warn(
            `Direct JPG embedding failed for ${file.name}, using canvas conversion...`
          );
          const jpegBytes = await convertImageToJpegBytes(file, 0.9);
          const jpgImage = await pdfDoc.embedJpg(jpegBytes);
          const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
          page.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: jpgImage.width,
            height: jpgImage.height,
          });
        }
      } else if (type === "image/png") {
        const pngBytes = await readFileAsArrayBuffer(file);
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });
      } else if (type === "image/heic") {
        const pngBytes = await convertHeicToPngBytes(file);
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });
      } else {
        const pngBytes = await convertImageToPngBytes(file);
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });
      }
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error(
      "No valid images could be processed. Please check your files."
    );
  }

  return {
    pdfDoc,
    successCount: pdfDoc.getPageCount(),
    failedFiles,
  };
};

export const convertMixedTypeImages = async (
  files: File[],
  quality: number
): Promise<ImageToPdfResult> => {
  if (files.length === 0) {
    throw new Error("Please select at least one image file.");
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      let jpegBytes: Uint8Array;

      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".heic") || lowerName.endsWith(".heif")) {
        const pngBytes = await convertHeicToPngBytes(file);
        const pngBlob = new Blob([pngBytes], { type: "image/png" });
        const imageBitmap = await createImageBitmap(pngBlob);
        const canvas = document.createElement("canvas");
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get canvas context.");
        }
        ctx.drawImage(imageBitmap, 0, 0);
        imageBitmap.close();
        const jpegBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", quality)
        );
        if (!jpegBlob) {
          throw new Error("Failed to convert to JPEG.");
        }
        jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      } else {
        jpegBytes = await convertImageToJpegBytes(file, quality);
      }

      const jpgImage = await pdfDoc.embedJpg(jpegBytes);
      const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: jpgImage.width,
        height: jpgImage.height,
      });
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error(
      "No valid images could be processed. Please check your files."
    );
  }

  return {
    pdfDoc,
    successCount: pdfDoc.getPageCount(),
    failedFiles,
  };
};
