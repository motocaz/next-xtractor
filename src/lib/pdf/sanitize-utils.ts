"use client";

import type { PDFDocument, PDFDict } from "pdf-lib";
import { PDFName } from "pdf-lib";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCatalogDict = (pdfDoc: PDFDocument): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (pdfDoc.catalog as any).dict;
};

const safeLookupAsDict = (
  pdfDoc: PDFDocument,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any,
): PDFDict | null => {
  try {
    const obj = pdfDoc.context.lookup(ref);
    if (obj && "has" in obj) {
      return obj as PDFDict;
    }
  } catch {}
  return null;
};

const deleteFromNamesDict = (
  pdfDoc: PDFDocument,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catalogDict: any,
  keyName: string,
  errorMessage: string,
): boolean => {
  const namesRef = catalogDict.get(PDFName.of("Names"));
  if (!namesRef) return false;

  try {
    const namesDict = safeLookupAsDict(pdfDoc, namesRef);
    if (namesDict?.has(PDFName.of(keyName))) {
      namesDict.delete(PDFName.of(keyName));
      return true;
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(errorMessage, error);
  }
  return false;
};

const deleteFromCatalogDict = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catalogDict: any,
  keyName: string,
): boolean => {
  if (catalogDict.has(PDFName.of(keyName))) {
    catalogDict.delete(PDFName.of(keyName));
    return true;
  }
  return false;
};

const deleteFromPageDict = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageDict: any,
  keyName: string,
): boolean => {
  if (pageDict.has(PDFName.of(keyName))) {
    pageDict.delete(PDFName.of(keyName));
    return true;
  }
  return false;
};

export const removeJavaScriptFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDocAny = pdfDoc as any;
    if (pdfDocAny.javaScripts && pdfDocAny.javaScripts.length > 0) {
      pdfDocAny.javaScripts = [];
      changesMade = true;
    }

    const catalogDict = getCatalogDict(pdfDoc);

    if (
      deleteFromNamesDict(
        pdfDoc,
        catalogDict,
        "JavaScript",
        "Could not access Names/JavaScript:",
      )
    ) {
      changesMade = true;
    }

    if (deleteFromCatalogDict(catalogDict, "OpenAction")) {
      changesMade = true;
    }

    if (deleteFromCatalogDict(catalogDict, "AA")) {
      changesMade = true;
    }

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      try {
        const pageDict = page.node;

        if (deleteFromPageDict(pageDict, "AA")) {
          changesMade = true;
        }

        const annotRefs = pageDict.Annots()?.asArray() || [];
        for (const annotRef of annotRefs) {
          try {
            const annotDict = safeLookupAsDict(pdfDoc, annotRef);
            if (!annotDict) {
              continue;
            }

            if (annotDict.has(PDFName.of("A"))) {
              const actionRef = annotDict.get(PDFName.of("A"));
              try {
                const actionDict = safeLookupAsDict(pdfDoc, actionRef);
                if (actionDict) {
                  const actionType = actionDict
                    .get(PDFName.of("S"))
                    ?.toString()
                    .substring(1);

                  if (actionType === "JavaScript") {
                    annotDict.delete(PDFName.of("A"));
                    changesMade = true;
                  }
                }
              } catch (e) {
                const error = e instanceof Error ? e.message : String(e);
                console.warn("Could not read action:", error);
              }
            }

            if (annotDict.has(PDFName.of("AA"))) {
              annotDict.delete(PDFName.of("AA"));
              changesMade = true;
            }
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            console.warn("Could not process annotation for JS:", error);
          }
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.warn("Could not remove page actions:", error);
      }
    }

    try {
      const acroFormRef = catalogDict.get(PDFName.of("AcroForm"));
      if (acroFormRef) {
        const acroFormDict = safeLookupAsDict(pdfDoc, acroFormRef);
        if (acroFormDict) {
          const fieldsRef = acroFormDict.get(PDFName.of("Fields"));

          if (fieldsRef) {
            const fieldsArray = pdfDoc.context.lookup(fieldsRef);
            if (fieldsArray && "asArray" in fieldsArray) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const fields = (fieldsArray as any).asArray();

              for (const fieldRef of fields) {
                try {
                  const fieldDict = safeLookupAsDict(pdfDoc, fieldRef);
                  if (fieldDict) {
                    if (fieldDict.has(PDFName.of("A"))) {
                      fieldDict.delete(PDFName.of("A"));
                      changesMade = true;
                    }

                    if (fieldDict.has(PDFName.of("AA"))) {
                      fieldDict.delete(PDFName.of("AA"));
                      changesMade = true;
                    }
                  }
                } catch (e) {
                  const error = e instanceof Error ? e.message : String(e);
                  console.warn("Could not process field for JS:", error);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.warn("Could not process form fields for JS:", error);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove JavaScript: ${error}`);
  }

  return changesMade;
};

export const removeEmbeddedFilesFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    const catalogDict = getCatalogDict(pdfDoc);

    if (
      deleteFromNamesDict(
        pdfDoc,
        catalogDict,
        "EmbeddedFiles",
        "Could not access Names/EmbeddedFiles:",
      )
    ) {
      changesMade = true;
    }

    if (deleteFromCatalogDict(catalogDict, "EmbeddedFiles")) {
      changesMade = true;
    }

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      try {
        const annotRefs = page.node.Annots()?.asArray() || [];
        const annotsToKeep: (typeof annotRefs)[number][] = [];

        for (const ref of annotRefs) {
          try {
            const annot = pdfDoc.context.lookup(ref);
            if (!annot || !("get" in annot)) {
              annotsToKeep.push(ref);
              continue;
            }

            const annotDict = annot as PDFDict;
            const subtype = annotDict
              .get(PDFName.of("Subtype"))
              ?.toString()
              .substring(1);

            if (subtype === "FileAttachment") {
              changesMade = true;
            } else {
              annotsToKeep.push(ref);
            }
          } catch {
            annotsToKeep.push(ref);
          }
        }

        if (annotsToKeep.length !== annotRefs.length) {
          if (annotsToKeep.length > 0) {
            const newAnnotsArray = pdfDoc.context.obj(annotsToKeep);
            page.node.set(PDFName.of("Annots"), newAnnotsArray);
          } else {
            page.node.delete(PDFName.of("Annots"));
          }
        }
      } catch (pageError) {
        const error =
          pageError instanceof Error ? pageError.message : String(pageError);
        console.warn(`Could not process page for attachments: ${error}`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDocAny = pdfDoc as any;
    if (pdfDocAny.embeddedFiles && pdfDocAny.embeddedFiles.length > 0) {
      pdfDocAny.embeddedFiles = [];
      changesMade = true;
    }

    if (deleteFromCatalogDict(catalogDict, "Collection")) {
      changesMade = true;
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove embedded files: ${error}`);
  }

  return changesMade;
};

export const removeLayersFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    const catalogDict = getCatalogDict(pdfDoc);

    if (deleteFromCatalogDict(catalogDict, "OCProperties")) {
      changesMade = true;
    }

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      try {
        const pageDict = page.node;

        if (deleteFromPageDict(pageDict, "OCProperties")) {
          changesMade = true;
        }

        const resourcesRef = pageDict.get(PDFName.of("Resources"));
        if (resourcesRef) {
          try {
            const resourcesDict = safeLookupAsDict(pdfDoc, resourcesRef);
            if (resourcesDict?.has(PDFName.of("Properties"))) {
              resourcesDict.delete(PDFName.of("Properties"));
              changesMade = true;
            }
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            console.warn("Could not access Resources:", error);
          }
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.warn("Could not remove page layers:", error);
      }
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove layers: ${error}`);
  }

  return changesMade;
};

export const removeLinksFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    const pages = pdfDoc.getPages();

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      try {
        const page = pages[pageIndex];
        const pageDict = page.node;

        const annotsRef = pageDict.get(PDFName.of("Annots"));
        if (!annotsRef) continue;

        const annotsArray = pdfDoc.context.lookup(annotsRef);
        if (!annotsArray || !("asArray" in annotsArray)) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const annotRefs = (annotsArray as any).asArray();

        if (annotRefs.length === 0) continue;

        const annotsToKeep: (typeof annotRefs)[number][] = [];
        let linksRemoved = 0;

        for (const ref of annotRefs) {
          try {
            const annot = pdfDoc.context.lookup(ref);
            if (!annot || !("get" in annot)) {
              annotsToKeep.push(ref);
              continue;
            }

            const annotDict = annot as PDFDict;
            const subtype = annotDict
              .get(PDFName.of("Subtype"))
              ?.toString()
              .substring(1);

            let isLink = false;

            if (subtype === "Link") {
              isLink = true;
              linksRemoved++;
            } else {
              const actionRef = annotDict.get(PDFName.of("A"));
              if (actionRef) {
                try {
                  const actionDict = safeLookupAsDict(pdfDoc, actionRef);
                  if (actionDict) {
                    const actionType = actionDict
                      .get(PDFName.of("S"))
                      ?.toString()
                      .substring(1);

                    if (
                      actionType === "URI" ||
                      actionType === "Launch" ||
                      actionType === "GoTo" ||
                      actionType === "GoToR"
                    ) {
                      isLink = true;
                      linksRemoved++;
                    }
                  }
                } catch (e) {
                  const error = e instanceof Error ? e.message : String(e);
                  console.warn("Could not read action:", error);
                }
              }

              const dest = annotDict.get(PDFName.of("Dest"));
              if (dest && !isLink) {
                isLink = true;
                linksRemoved++;
              }
            }

            if (!isLink) {
              annotsToKeep.push(ref);
            }
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            console.warn("Could not process annotation:", error);
            annotsToKeep.push(ref);
          }
        }

        if (linksRemoved > 0) {
          if (annotsToKeep.length > 0) {
            const newAnnotsArray = pdfDoc.context.obj(annotsToKeep);
            pageDict.set(PDFName.of("Annots"), newAnnotsArray);
          } else {
            pageDict.delete(PDFName.of("Annots"));
          }
          changesMade = true;
        }
      } catch (pageError) {
        const error =
          pageError instanceof Error ? pageError.message : String(pageError);
        console.warn(
          `Could not process page ${pageIndex + 1} for links: ${error}`,
        );
      }
    }

    try {
      const catalogDict = getCatalogDict(pdfDoc);
      if (
        deleteFromNamesDict(
          pdfDoc,
          catalogDict,
          "Dests",
          "Could not access Names/Dests:",
        )
      ) {
        changesMade = true;
      }

      if (deleteFromCatalogDict(catalogDict, "Dests")) {
        changesMade = true;
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.warn("Could not remove named destinations:", error);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove links: ${error}`);
  }

  return changesMade;
};

export const removeStructureTreeFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    const catalogDict = getCatalogDict(pdfDoc);

    if (deleteFromCatalogDict(catalogDict, "StructTreeRoot")) {
      changesMade = true;
    }

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      try {
        const pageDict = page.node;
        if (deleteFromPageDict(pageDict, "StructParents")) {
          changesMade = true;
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.warn("Could not remove page StructParents:", error);
      }
    }

    if (deleteFromCatalogDict(catalogDict, "ParentTree")) {
      changesMade = true;
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove structure tree: ${error}`);
  }

  return changesMade;
};

export const removeMarkInfoFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    const catalogDict = getCatalogDict(pdfDoc);

    if (deleteFromCatalogDict(catalogDict, "MarkInfo")) {
      changesMade = true;
    }

    if (deleteFromCatalogDict(catalogDict, "Marked")) {
      changesMade = true;
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove MarkInfo: ${error}`);
  }

  return changesMade;
};

export const removeFontsFromDoc = (pdfDoc: PDFDocument): boolean => {
  let changesMade = false;

  try {
    const pages = pdfDoc.getPages();

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      try {
        const page = pages[pageIndex];
        const pageDict = page.node;
        const resourcesRef = pageDict.get(PDFName.of("Resources"));

        if (resourcesRef) {
          try {
            const resourcesDict = pdfDoc.context.lookup(resourcesRef);
            if (!resourcesDict || !("has" in resourcesDict)) {
              continue;
            }

            const resourcesDictTyped = resourcesDict as PDFDict;

            if (resourcesDictTyped.has(PDFName.of("Font"))) {
              const fontRef = resourcesDictTyped.get(PDFName.of("Font"));

              try {
                const fontDict = pdfDoc.context.lookup(fontRef);
                if (!fontDict || !("keys" in fontDict)) {
                  continue;
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fontDictAny = fontDict as any;
                const fontKeys = fontDictAny.keys();

                for (const fontKey of fontKeys) {
                  try {
                    const specificFontRef = fontDictAny.get(fontKey);
                    const specificFont = pdfDoc.context.lookup(specificFontRef);
                    if (!specificFont || !("has" in specificFont)) {
                      continue;
                    }

                    const specificFontTyped = specificFont as PDFDict;
                    if (specificFontTyped.has(PDFName.of("FontDescriptor"))) {
                      const descriptorRef = specificFontTyped.get(
                        PDFName.of("FontDescriptor"),
                      );
                      const descriptor = pdfDoc.context.lookup(descriptorRef);
                      if (!descriptor || !("has" in descriptor)) {
                        continue;
                      }

                      const descriptorTyped = descriptor as PDFDict;
                      const fontFileKeys = [
                        "FontFile",
                        "FontFile2",
                        "FontFile3",
                      ];
                      for (const key of fontFileKeys) {
                        if (descriptorTyped.has(PDFName.of(key))) {
                          descriptorTyped.delete(PDFName.of(key));
                          changesMade = true;
                        }
                      }
                    }
                  } catch (e) {
                    const error = e instanceof Error ? e.message : String(e);
                    console.warn(`Could not process font ${fontKey}:`, error);
                  }
                }
              } catch (e) {
                const error = e instanceof Error ? e.message : String(e);
                console.warn("Could not access font dictionary:", error);
              }
            }
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            console.warn("Could not access Resources for fonts:", error);
          }
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.warn(
          `Could not remove fonts from page ${pageIndex + 1}:`,
          error,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDocAny = pdfDoc as any;
    if (pdfDocAny.fonts && pdfDocAny.fonts.length > 0) {
      pdfDocAny.fonts = [];
      changesMade = true;
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.warn(`Could not remove fonts: ${error}`);
  }

  return changesMade;
};
