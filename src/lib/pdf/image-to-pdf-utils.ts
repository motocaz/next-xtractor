"use client";

import { PDFDocument, PDFImage } from "pdf-lib";
import { saveAndDownloadPDF } from "./file-utils";

export interface ImageToPdfResult {
  pdfDoc: PDFDocument;
  successCount: number;
  failedFiles: string[];
}

export interface HandleImageToPdfResultOptions {
  result: ImageToPdfResult;
  firstFileName: string;
  extensionPattern: RegExp;
  stateSetters: {
    setFailedFiles: (files: string[]) => void;
    setSuccess: (message: string) => void;
  };
}

export const addImageAsPage = (
  pdfDoc: PDFDocument,
  embeddedImage: PDFImage
): void => {
  const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: embeddedImage.width,
    height: embeddedImage.height,
  });
};

export const createImageToPdfResult = (
  pdfDoc: PDFDocument,
  failedFiles: string[]
): ImageToPdfResult => {
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

export const convertImagesToPdf = async (
  files: File[],
  convertToPngBytes: (file: File) => Promise<ArrayBuffer>,
  emptyFilesError: string
): Promise<ImageToPdfResult> => {
  if (files.length === 0) {
    throw new Error(emptyFilesError);
  }

  const pdfDoc = await PDFDocument.create();
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const pngBytes = await convertToPngBytes(file);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      addImageAsPage(pdfDoc, pngImage);
    } catch (error) {
      console.warn(`Failed to process ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  return createImageToPdfResult(pdfDoc, failedFiles);
};

export const handleImageToPdfResult = async (
  options: HandleImageToPdfResultOptions
): Promise<void> => {
  const { result, firstFileName, extensionPattern, stateSetters } = options;
  const { setFailedFiles, setSuccess } = stateSetters;

  const pdfBytes = await result.pdfDoc.save();
  const baseName = firstFileName.replace(extensionPattern, "") || "converted";
  saveAndDownloadPDF(pdfBytes, baseName);

  if (result.failedFiles.length > 0) {
    setFailedFiles(result.failedFiles);
  }

  let successMessage = `Successfully converted ${result.successCount} image(s) to PDF.`;
  if (result.failedFiles.length > 0) {
    successMessage += ` ${result.failedFiles.length} file(s) could not be processed.`;
  }
  setSuccess(successMessage);
};

export const convertImageToPngBytes = async (
  file: File
): Promise<ArrayBuffer> => {
  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  let objectUrl: string | null = null;

  if (isSvg) {
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {}
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onload = async () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (
          width === 0 ||
          height === 0 ||
          !Number.isFinite(width) ||
          !Number.isFinite(height)
        ) {
          width = width || 800;
          height = height || 600;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          cleanup();
          reject(new Error("Failed to get canvas context."));
          return;
        }

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        const pngBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/png")
        );

        if (!pngBlob) {
          cleanup();
          reject(new Error("Failed to convert image to PNG."));
          return;
        }

        const pngBytes = await pngBlob.arrayBuffer();
        cleanup();
        resolve(pngBytes);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("Failed to load image."));
    };

    if (objectUrl) {
      img.src = objectUrl;
    } else {
      reader.onload = (e) => {
        if (!e.target?.result || typeof e.target.result !== "string") {
          cleanup();
          reject(new Error("Failed to read file."));
          return;
        }
        img.src = e.target.result;
      };

      reader.onerror = () => {
        cleanup();
        reject(new Error("Failed to read file."));
      };
      reader.readAsDataURL(file);
    }
  });
};

export const convertHeicToPngBytes = async (
  file: File
): Promise<ArrayBuffer> => {
  const heic2any = (await import("heic2any")).default;

  try {
    const conversionResult = await heic2any({
      blob: file,
      toType: "image/png",
    });

    const pngBlob = Array.isArray(conversionResult)
      ? conversionResult[0]
      : conversionResult;

    if (!pngBlob) {
      throw new Error("Failed to convert HEIC to PNG.");
    }

    const pngBytes = await pngBlob.arrayBuffer();
    return pngBytes;
  } catch (error) {
    throw new Error(
      `Failed to convert HEIC to PNG: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
