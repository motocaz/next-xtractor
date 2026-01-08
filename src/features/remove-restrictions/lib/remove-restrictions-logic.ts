"use client";

import {
  initializeQpdf,
  prepareQpdfFile,
  readQpdfOutput,
  cleanupQpdfFiles,
} from "@/lib/pdf/qpdf-utils";

export const removeRestrictions = async (
  file: File,
  ownerPassword?: string,
): Promise<Blob> => {
  const inputPath = "/input.pdf";
  const outputPath = "/output.pdf";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qpdf: any;

  try {
    qpdf = await initializeQpdf();

    await prepareQpdfFile(qpdf, file, inputPath);

    const args = [inputPath];

    if (ownerPassword && ownerPassword.trim().length > 0) {
      args.push(`--password=${ownerPassword}`);
    }

    args.push("--decrypt", "--remove-restrictions", "--", outputPath);

    try {
      qpdf.callMain(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (qpdfError: any) {
      console.error("qpdf execution error:", qpdfError);

      const errorMsg = qpdfError.message || "";

      if (
        errorMsg.includes("password") ||
        errorMsg.includes("encrypt") ||
        errorMsg.includes("invalid password")
      ) {
        throw new Error(
          "Failed to remove restrictions. The PDF may require the correct owner password.",
        );
      }

      throw new Error(
        "Failed to remove restrictions: " + (errorMsg || "Unknown error"),
      );
    }

    const blob = readQpdfOutput(
      qpdf,
      outputPath,
      "Operation resulted in an empty file.",
    );
    return blob;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during restriction removal:", error);
    throw error;
  } finally {
    cleanupQpdfFiles(qpdf, inputPath, outputPath);
  }
};
