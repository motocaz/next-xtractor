"use client";

import createModule from "@neslinesli93/qpdf-wasm";
import { readFileAsArrayBuffer } from "./file-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let qpdfInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializeQpdf = async (): Promise<any> => {
  if (qpdfInstance) return qpdfInstance;

  try {
    qpdfInstance = await createModule({
      locateFile: () => "/qpdf.wasm",
    });
  } catch (error) {
    console.error("Failed to initialize qpdf-wasm:", error);
    throw new Error(
      "Could not load the PDF engine. Please refresh the page and try again."
    );
  }

  return qpdfInstance;
};

export const prepareQpdfFile = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qpdf: any,
  file: File,
  inputPath: string
): Promise<void> => {
  const fileBuffer = await readFileAsArrayBuffer(file);
  const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);
  qpdf.FS.writeFile(inputPath, uint8Array);
};

export const readQpdfOutput = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qpdf: any,
  outputPath: string,
  errorMessage?: string
): Blob => {
  const outputFile = qpdf.FS.readFile(outputPath, { encoding: "binary" });

  if (!outputFile || outputFile.length === 0) {
    throw new Error(errorMessage || "Processing resulted in an empty file.");
  }

  return new Blob([outputFile], { type: "application/pdf" });
};

export const cleanupQpdfFiles = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qpdf: any,
  inputPath: string,
  outputPath: string
): void => {
  try {
    if (qpdf?.FS) {
      try {
        qpdf.FS.unlink(inputPath);
      } catch {}
      try {
        qpdf.FS.unlink(outputPath);
      } catch {}
    }
  } catch (cleanupError) {
    console.warn("Failed to cleanup WASM FS:", cleanupError);
  }
};
