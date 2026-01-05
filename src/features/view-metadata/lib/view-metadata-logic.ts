"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { parsePdfDate, parseXmpMetadata } from "@/lib/pdf/metadata-utils";
import type { ViewMetadataResult, InfoDictionaryMetadata, FormField } from "../types";

export const extractMetadataFromPDF = async (
  pdfDoc: PDFDocumentProxy
): Promise<ViewMetadataResult> => {
  const [metadataResult, fieldObjects] = await Promise.all([
    pdfDoc.getMetadata(),
    pdfDoc.getFieldObjects(),
  ]);

  const { info, metadata } = metadataResult;
  const rawXmpString = metadata ? metadata.getRaw() : null;

  const infoDict: InfoDictionaryMetadata = {};
  if (info && Object.keys(info).length > 0) {
    const infoRecord = info as Record<string, unknown>;
    for (const key in infoRecord) {
      const value = infoRecord[key];
      let displayValue: string;

      if (value === null || value === undefined) {
        displayValue = "- Not Set -";
      } else if (typeof value === "object" && "name" in value) {
        displayValue = (value as { name: string }).name;
      } else if (typeof value === "object") {
        try {
          displayValue = JSON.stringify(value);
        } catch {
          displayValue = "[object Object]";
        }
      } else if (
        (key === "CreationDate" || key === "ModDate") &&
        typeof value === "string"
      ) {
        displayValue = parsePdfDate(value);
      } else {
        displayValue = String(value);
      }

      infoDict[key] = displayValue;
    }
  }

  const formFields: FormField[] = [];
  if (fieldObjects && Object.keys(fieldObjects).length > 0) {
    for (const fieldName in fieldObjects) {
      const field = fieldObjects[fieldName][0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (field as any).fieldValue || null;
      formFields.push({
        fieldName,
        fieldValue: value ? String(value) : null,
      });
    }
  }

  const xmpNodes = parseXmpMetadata(rawXmpString);

  return {
    info: infoDict,
    formFields,
    xmpNodes,
    rawXmpString,
  };
};

