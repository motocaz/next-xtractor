"use client";

import createModule from "@neslinesli93/qpdf-wasm";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let qpdfInstance: any = null;

const initializeQpdf = async () => {
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

export const decryptPDF = async (
  file: File,
  password: string
): Promise<Blob> => {
  const inputPath = "/input.pdf";
  const outputPath = "/output.pdf";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qpdf: any;

  try {
    qpdf = await initializeQpdf();

    const fileBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);
    qpdf.FS.writeFile(inputPath, uint8Array);
    const args = [inputPath, "--password=" + password, "--decrypt", outputPath];

    try {
      const varr = qpdf.callMain(args);
      console.log(varr);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (qpdfError: any) {
      console.error("qpdf execution error:", qpdfError);

      const errorMsg = qpdfError.message || "";
      console.log("errorMsg: ", qpdfError);
      console.log("errorrrdafsfd");

      if (
        errorMsg.includes("invalid password") ||
        errorMsg.includes("password")
      ) {
        throw new Error("INVALID_PASSWORD");
      }

      throw new Error("Decryption failed: " + (errorMsg || "Unknown error"));
    }

    const outputFile = qpdf.FS.readFile(outputPath, { encoding: "binary" });

    if (!outputFile || outputFile.length === 0) {
      throw new Error("Decryption resulted in an empty file.");
    }

    const blob = new Blob([outputFile], { type: "application/pdf" });
    return blob;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during PDF decryption:", error);
    throw error;
  } finally {
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
  }
};
