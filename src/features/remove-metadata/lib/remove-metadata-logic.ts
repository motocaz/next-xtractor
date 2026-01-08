"use client";

import type { PDFDocument } from "pdf-lib";
import { removeMetadataFromDoc } from "@/lib/pdf/metadata-utils";

export const removeMetadata = (pdfDoc: PDFDocument): void => {
  removeMetadataFromDoc(pdfDoc);
};
