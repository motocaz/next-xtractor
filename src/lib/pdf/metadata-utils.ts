"use client";

import type { PDFDocument } from "pdf-lib";
import { PDFName } from "pdf-lib";

export const parsePdfDate = (pdfDate: string | null | undefined): string => {
  if (!pdfDate || typeof pdfDate !== "string" || !pdfDate.startsWith("D:")) {
    return pdfDate || "";
  }
  try {
    const year = pdfDate.substring(2, 6);
    const month = pdfDate.substring(6, 8);
    const day = pdfDate.substring(8, 10);
    const hour = pdfDate.substring(10, 12);
    const minute = pdfDate.substring(12, 14);
    const second = pdfDate.substring(14, 16);
    return new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}Z`,
    ).toLocaleString();
  } catch {
    return pdfDate;
  }
};

export const formatIsoDate = (
  isoDateString: string | null | undefined,
): string => {
  if (!isoDateString || typeof isoDateString !== "string") {
    return isoDateString || "";
  }
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return isoDateString;
    }
    return date.toLocaleString();
  } catch (e) {
    console.error("Could not parse ISO date:", e);
    return isoDateString;
  }
};

export interface XmpMetadataNode {
  key: string;
  value: string;
  indent: number;
  isHeader: boolean;
}

export const parseXmpMetadata = (
  rawXmpString: string | null,
): XmpMetadataNode[] => {
  if (!rawXmpString) {
    return [];
  }

  const nodes: XmpMetadataNode[] = [];
  const xmpDateKeys = ["xap:CreateDate", "xap:ModifyDate", "xap:MetadataDate"];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawXmpString, "application/xml");

    const appendXmpNodes = (xmlNode: Element, indentLevel: number): void => {
      const childNodes = Array.from(xmlNode.children);

      for (const child of childNodes) {
        if (child.nodeType !== 1) continue;

        let key = child.tagName;
        const elementChildren = Array.from(child.children).filter(
          (c) => c.nodeType === 1,
        );

        if (key === "rdf:li") {
          appendXmpNodes(child, indentLevel);
          continue;
        }
        if (key === "rdf:Alt") {
          key = "(alt container)";
        }

        if (
          child.getAttribute("rdf:parseType") === "Resource" &&
          elementChildren.length === 0
        ) {
          nodes.push({
            key,
            value: "(Empty Resource)",
            indent: indentLevel,
            isHeader: false,
          });
          continue;
        }

        if (elementChildren.length > 0) {
          nodes.push({
            key,
            value: "",
            indent: indentLevel,
            isHeader: true,
          });
          appendXmpNodes(child, indentLevel + 1);
        } else {
          let value = child.textContent?.trim() || "";
          if (value) {
            if (xmpDateKeys.includes(key)) {
              value = formatIsoDate(value);
            }
            nodes.push({
              key,
              value,
              indent: indentLevel,
              isHeader: false,
            });
          }
        }
      }
    };

    const descriptions = xmlDoc.getElementsByTagName("rdf:Description");
    if (descriptions.length > 0) {
      for (const desc of descriptions) {
        appendXmpNodes(desc, 0);
      }
    } else {
      appendXmpNodes(xmlDoc.documentElement, 0);
    }
  } catch (xmlError) {
    console.error("Failed to parse XMP XML:", xmlError);
    nodes.push({
      key: "Error",
      value: "Failed to parse XMP XML. Raw data available.",
      indent: 0,
      isHeader: false,
    });
  }

  return nodes;
};

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
