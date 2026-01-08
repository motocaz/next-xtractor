import { PDFName, PDFString } from "pdf-lib";
import type { PDFDocument } from "pdf-lib";
import type { PDFMetadata, CustomMetadataField } from "../types";

export const extractCustomMetadataFields = (
  pdfDoc: PDFDocument,
): Map<string, string> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoDict = (pdfDoc as any).getInfoDict();
  const standardKeys = new Set([
    "Title",
    "Author",
    "Subject",
    "Keywords",
    "Creator",
    "Producer",
    "CreationDate",
    "ModDate",
  ]);

  const customFields = new Map<string, string>();
  const allKeys = infoDict
    .keys()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((key: any) => key.asString().substring(1));

  allKeys.forEach((key: string) => {
    if (!standardKeys.has(key)) {
      const value = infoDict.get(PDFName.of(key));
      if (value) {
        try {
          const valueString = value.asString();
          const cleanValue = valueString.startsWith("/")
            ? valueString.substring(1)
            : valueString;
          customFields.set(key, cleanValue);
        } catch {}
      }
    }
  });

  return customFields;
};

export const editPDFMetadata = async (
  pdfDoc: PDFDocument,
  metadata: PDFMetadata,
  customFields: CustomMetadataField[],
  preserveExistingCustomFields: boolean = true,
): Promise<PDFDocument> => {
  pdfDoc.setTitle(metadata.title || "");
  pdfDoc.setAuthor(metadata.author || "");
  pdfDoc.setSubject(metadata.subject || "");
  pdfDoc.setCreator(metadata.creator || "");
  pdfDoc.setProducer(metadata.producer || "");

  const keywordsArray = metadata.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  pdfDoc.setKeywords(keywordsArray);

  if (metadata.creationDate) {
    try {
      pdfDoc.setCreationDate(new Date(metadata.creationDate));
    } catch (error) {
      console.warn("Invalid creation date format:", error);
    }
  }

  if (metadata.modificationDate) {
    try {
      pdfDoc.setModificationDate(new Date(metadata.modificationDate));
    } catch (error) {
      console.warn("Invalid modification date format:", error);
      pdfDoc.setModificationDate(new Date());
    }
  } else {
    pdfDoc.setModificationDate(new Date());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoDict = (pdfDoc as any).getInfoDict();
  const standardKeys = new Set([
    "Title",
    "Author",
    "Subject",
    "Keywords",
    "Creator",
    "Producer",
    "CreationDate",
    "ModDate",
  ]);

  const existingCustomFields = preserveExistingCustomFields
    ? extractCustomMetadataFields(pdfDoc)
    : new Map<string, string>();

  const allKeys = infoDict
    .keys()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((key: any) => key.asString().substring(1));

  allKeys.forEach((key: string) => {
    if (!standardKeys.has(key)) {
      infoDict.delete(PDFName.of(key));
    }
  });

  const mergedCustomFields = new Map<string, string>(existingCustomFields);

  customFields.forEach((field) => {
    const trimmedKey = field.key.trim();
    const trimmedValue = field.value.trim();
    if (trimmedKey && trimmedValue) {
      mergedCustomFields.set(trimmedKey, trimmedValue);
    }
  });

  // Write merged custom fields back to PDF
  mergedCustomFields.forEach((value, key) => {
    infoDict.set(PDFName.of(key), PDFString.of(value));
  });

  return pdfDoc;
};
