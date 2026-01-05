"use client";

import type { PDFDocument } from "pdf-lib";
import { PDFName } from "pdf-lib";

export const removeMetadataFromDoc = (pdfDoc: PDFDocument): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const infoDict = (pdfDoc as any).getInfoDict();
    const allKeys = infoDict.keys();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allKeys.forEach((key: any) => {
      infoDict.delete(key);
    });
  } catch (e) {
    console.warn("Could not remove info dict keys:", e);
  }

  try {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator("");
    pdfDoc.setProducer("");
  } catch (e) {
    console.warn("Could not remove standard metadata fields:", e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catalogDict = (pdfDoc.catalog as any).dict;
    if (catalogDict.has(PDFName.of("Metadata"))) {
      catalogDict.delete(PDFName.of("Metadata"));
    }
  } catch (e) {
    console.warn("Could not remove XMP metadata:", e);
  }

  try {
    const context = pdfDoc.context;
    if (context.trailerInfo) {
      delete context.trailerInfo.ID;
    }
  } catch (e) {
    console.warn("Could not remove document IDs:", e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catalogDict = (pdfDoc.catalog as any).dict;
    if (catalogDict.has(PDFName.of("PieceInfo"))) {
      catalogDict.delete(PDFName.of("PieceInfo"));
    }
  } catch (e) {
    console.warn("Could not remove PieceInfo:", e);
  }
};
