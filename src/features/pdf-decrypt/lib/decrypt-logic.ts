"use client";

import {
  initializeQpdf,
  prepareQpdfFile,
  readQpdfOutput,
  cleanupQpdfFiles,
} from "@/lib/pdf/qpdf-utils";

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

    await prepareQpdfFile(qpdf, file, inputPath);

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

    const blob = readQpdfOutput(
      qpdf,
      outputPath,
      "Decryption resulted in an empty file."
    );
    return blob;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during PDF decryption:", error);
    throw error;
  } finally {
    cleanupQpdfFiles(qpdf, inputPath, outputPath);
  }
};
