"use client";

import {
  initializeQpdf,
  prepareQpdfFile,
  readQpdfOutput,
  cleanupQpdfFiles,
} from "@/lib/pdf/qpdf-utils";
import type { EncryptPDFOptions } from "../types";

export const encryptPDF = async (
  file: File,
  options: EncryptPDFOptions,
): Promise<Blob> => {
  if (!options.userPassword || options.userPassword.trim().length === 0) {
    throw new Error("User password is required");
  }

  const inputPath = "/input.pdf";
  const outputPath = "/output.pdf";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qpdf: any;

  try {
    qpdf = await initializeQpdf();

    await prepareQpdfFile(qpdf, file, inputPath);

    const ownerPassword = options.ownerPassword || options.userPassword;
    const hasDistinctOwnerPassword =
      options.ownerPassword && options.ownerPassword !== options.userPassword;

    const args = [
      inputPath,
      "--encrypt",
      options.userPassword,
      ownerPassword,
      "256",
    ];

    if (hasDistinctOwnerPassword) {
      args.push(
        "--modify=none",
        "--extract=n",
        "--print=none",
        "--accessibility=n",
        "--annotate=n",
        "--assemble=n",
        "--form=n",
        "--modify-other=n",
      );
    }

    args.push("--", outputPath);

    try {
      qpdf.callMain(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (qpdfError: any) {
      console.error("qpdf execution error:", qpdfError);
      throw new Error(
        "Encryption failed: " + (qpdfError.message || "Unknown error"),
      );
    }

    const blob = readQpdfOutput(
      qpdf,
      outputPath,
      "Encryption resulted in an empty file.",
    );

    return blob;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during PDF encryption:", error);
    throw error;
  } finally {
    cleanupQpdfFiles(qpdf, inputPath, outputPath);
  }
};
