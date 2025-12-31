import { PDFName } from "pdf-lib";
import type { PDFDocument } from "pdf-lib";
import type { BookmarkNode } from "../types";

type PDFObjectWithLookup = {
  lookup: (name: ReturnType<typeof PDFName.of>) => unknown;
  [key: string]: unknown;
};

const hasDecodeText = (
  obj: unknown
): obj is { decodeText: () => string } => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "decodeText" in obj &&
    typeof (obj as { decodeText: unknown }).decodeText === "function"
  );
};

const hasLookup = (obj: unknown): obj is PDFObjectWithLookup => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "lookup" in obj &&
    typeof (obj as PDFObjectWithLookup).lookup === "function"
  );
};

const isArrayLike = (obj: unknown): obj is { array: unknown[] } => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "array" in obj &&
    Array.isArray((obj as { array: unknown[] }).array)
  );
};

const hasNumberValue = (obj: unknown): obj is { numberValue: number } => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "numberValue" in obj &&
    typeof (obj as { numberValue: unknown }).numberValue === "number"
  );
};

const hasObjectNumber = (
  obj: unknown
): obj is { objectNumber: number } => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "objectNumber" in obj &&
    typeof (obj as { objectNumber: unknown }).objectNumber === "number"
  );
};

const hasToString = (obj: unknown): obj is { toString: () => string } => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "toString" in obj &&
    typeof (obj as { toString: unknown }).toString === "function"
  );
};

const hasDictEntries = (
  obj: unknown
): obj is { dict: { entries: () => Iterable<[unknown, unknown]> } } => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "dict" in obj &&
    obj.dict !== null &&
    typeof obj.dict === "object" &&
    "entries" in obj.dict &&
    typeof (obj.dict as { entries: unknown }).entries === "function"
  );
};

const resolveRef = (doc: PDFDocument, obj: unknown): unknown => {
  if (!obj) return null;
  if (hasLookup(obj)) {
    return obj;
  }
  if (hasObjectNumber(obj) && doc.context) {
    try {
      return doc.context.lookup(
        obj as Parameters<typeof doc.context.lookup>[0]
      );
    } catch {
      return obj;
    }
  }
  return obj;
};

const extractDecodeText = (obj: unknown): string => {
  if (hasDecodeText(obj)) {
    return obj.decodeText();
  }
  return String(obj);
};

const buildNamedDestinations = (
  doc: PDFDocument,
  resolveRefFn: (doc: PDFDocument, obj: unknown) => unknown
): Map<string, unknown> => {
  const namedDests = new Map<string, unknown>();

  try {
    const addNamePair = (nameObj: unknown, destObj: unknown): void => {
      if (!nameObj || !destObj) return;

      try {
        const key = extractDecodeText(nameObj);
        if (key) {
          const resolvedDest = resolveRefFn(doc, destObj);
          if (resolvedDest !== null) {
            namedDests.set(key, resolvedDest);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.debug("Skipped invalid name-destination pair:", error);
        }
      }
    };

    const traverseNamesNode = (node: unknown): void => {
      if (!node) return;
      const resolved = resolveRefFn(doc, node);
      if (!resolved) return;

      const resolvedNode = resolved as PDFObjectWithLookup | null;
      if (!hasLookup(resolvedNode)) return;

      const namesArray = resolvedNode.lookup(PDFName.of("Names"));
      if (isArrayLike(namesArray)) {
        const arr = namesArray.array;
        for (let i = 0; i < arr.length; i += 2) {
          const n = arr[i];
          const d = arr[i + 1];
          addNamePair(n, d);
        }
      }

      const kidsArray = resolvedNode.lookup(PDFName.of("Kids"));
      if (isArrayLike(kidsArray)) {
        const arr = kidsArray.array;
        for (const kid of arr) traverseNamesNode(kid);
      }
    };

    const names = doc.catalog.lookup(PDFName.of("Names"));
    if (names) {
      const resolvedNames = resolveRefFn(doc, names) as PDFObjectWithLookup | null;
      if (hasLookup(resolvedNames)) {
        const destsTree = resolvedNames.lookup(PDFName.of("Dests"));
        if (destsTree) traverseNamesNode(destsTree);
      }
    }

    const catalogDests = doc.catalog.lookup(PDFName.of("Dests"));
    if (catalogDests) {
      const resolvedDests = resolveRefFn(doc, catalogDests);
      if (hasDictEntries(resolvedDests)) {
        const entries = resolvedDests.dict.entries();
        for (const [key, value] of entries) {
          const keyStr = extractDecodeText(key);
          namedDests.set(keyStr, resolveRefFn(doc, value));
        }
      }
    }
  } catch (e) {
    console.error("Error building named destinations:", e);
  }

  return namedDests;
};

const findPageIndex = (
  doc: PDFDocument,
  pages: ReturnType<PDFDocument["getPages"]>,
  pageRef: unknown,
  resolveRefFn: (doc: PDFDocument, obj: unknown) => unknown
): number => {
  if (!pageRef) return 0;

  try {
    const resolved = resolveRefFn(doc, pageRef);

    if (hasNumberValue(pageRef)) {
      const numericIndex = pageRef.numberValue | 0;
      if (numericIndex >= 0 && numericIndex < pages.length) return numericIndex;
    }

    if (hasObjectNumber(pageRef)) {
      const idxByObjNum = pages.findIndex(
        (p) => p.ref.objectNumber === pageRef.objectNumber
      );
      if (idxByObjNum !== -1) return idxByObjNum;
    }

    if (hasToString(pageRef)) {
      const target = pageRef.toString();
      const idxByString = pages.findIndex(
        (p) => p.ref.toString() === target
      );
      if (idxByString !== -1) return idxByString;
    }

    for (let i = 0; i < pages.length; i++) {
      try {
        const pageDict = doc.context.lookup(pages[i].ref);
        if (pageDict === resolved) return i;
      } catch {
        // Continue to next page
      }
    }
  } catch (e) {
    console.error("Error finding page:", e);
  }

  console.warn("Falling back to page 0 for destination");
  return 0;
};

const getDestination = (
  item: PDFObjectWithLookup,
  namedDests: Map<string, unknown>,
  resolveRefFn: (doc: PDFDocument, obj: unknown) => unknown,
  doc: PDFDocument
): unknown => {
  let dest = item.lookup(PDFName.of("Dest"));

  if (!dest) {
    const actionRef = item.lookup(PDFName.of("A"));
    const action = resolveRefFn(doc, actionRef) as PDFObjectWithLookup | null;
    if (hasLookup(action)) {
      dest = action.lookup(PDFName.of("D"));
    }
  }

  if (dest && (typeof dest !== "object" || !("array" in dest))) {
    try {
      const name = extractDecodeText(dest);
      if (namedDests.has(name)) {
        dest = namedDests.get(name);
      } else if (hasLookup(dest)) {
        const maybeDict = resolveRefFn(doc, dest) as PDFObjectWithLookup | null;
        const dictD = hasLookup(maybeDict)
          ? maybeDict.lookup(PDFName.of("D"))
          : null;
        if (dictD) dest = resolveRefFn(doc, dictD);
      }
    } catch {
      // Continue with original dest
    }
  }

  return resolveRefFn(doc, dest);
};

const parseDestinationCoords = (
  dest: unknown,
  doc: PDFDocument,
  pages: ReturnType<PDFDocument["getPages"]>,
  resolveRefFn: (doc: PDFDocument, obj: unknown) => unknown,
  findPageIndexFn: (
    doc: PDFDocument,
    pages: ReturnType<PDFDocument["getPages"]>,
    pageRef: unknown,
    resolveRefFn: (doc: PDFDocument, obj: unknown) => unknown
  ) => number
): {
  pageIndex: number;
  destX: number | null;
  destY: number | null;
  zoom: string | null;
} => {
  let pageIndex = 0;
  let destX: number | null = null;
  let destY: number | null = null;
  let zoom: string | null = null;

  if (isArrayLike(dest)) {
    const pageRef = dest.array[0];
    pageIndex = findPageIndexFn(doc, pages, pageRef, resolveRefFn);

    if (dest.array.length > 2) {
      const xObj = resolveRefFn(doc, dest.array[2]);
      const yObj = resolveRefFn(doc, dest.array[3]);
      const zoomObj = resolveRefFn(doc, dest.array[4]);

      if (hasNumberValue(xObj)) {
        destX = xObj.numberValue;
      }
      if (hasNumberValue(yObj)) {
        destY = yObj.numberValue;
      }
      if (hasNumberValue(zoomObj)) {
        zoom = String(Math.round(zoomObj.numberValue * 100));
      }
    }
  }

  return { pageIndex, destX, destY, zoom };
};

const parseBookmarkColor = (colorObj: unknown): string | null => {
  if (!isArrayLike(colorObj) || colorObj.array.length < 3) {
    return null;
  }

  const [r, g, b] = colorObj.array as number[];
  if (r > 0.8 && g < 0.3 && b < 0.3) return "red";
  if (r < 0.3 && g < 0.3 && b > 0.8) return "blue";
  if (r < 0.3 && g > 0.8 && b < 0.3) return "green";
  if (r > 0.8 && g > 0.8 && b < 0.3) return "yellow";
  if (r > 0.5 && g < 0.5 && b > 0.5) return "purple";
  return null;
};

const parseBookmarkStyle = (flagsObj: unknown): string | null => {
  if (!hasNumberValue(flagsObj)) {
    return null;
  }

  const flags = flagsObj.numberValue;
  const isBold = (flags & 2) !== 0;
  const isItalic = (flags & 1) !== 0;

  if (isBold && isItalic) return "bold-italic";
  if (isBold) return "bold";
  if (isItalic) return "italic";
  return null;
};

const extractBookmarkTitle = (title: unknown): string => {
  if (hasDecodeText(title)) {
    return title.decodeText();
  }
  return "Untitled";
};

const traverseBookmarkTree = (
  item: unknown,
  doc: PDFDocument,
  pages: ReturnType<PDFDocument["getPages"]>,
  namedDests: Map<string, unknown>,
  resolveRefFn: (doc: PDFDocument, obj: unknown) => unknown
): BookmarkNode | null => {
  if (!item) return null;
  const resolvedItem = resolveRefFn(doc, item);
  if (!resolvedItem) return null;

  const itemObj = resolvedItem as PDFObjectWithLookup | null;
  if (!hasLookup(itemObj)) return null;

  const title = itemObj.lookup(PDFName.of("Title"));
  const dest = getDestination(itemObj, namedDests, resolveRefFn, doc);
  const colorObj = itemObj.lookup(PDFName.of("C"));
  const flagsObj = itemObj.lookup(PDFName.of("F"));

  const coords = parseDestinationCoords(
    dest,
    doc,
    pages,
    resolveRefFn,
    findPageIndex
  );

  const color = parseBookmarkColor(colorObj);
  const style = parseBookmarkStyle(flagsObj);

  const bookmark: BookmarkNode = {
    id: String(Date.now() + Math.random()),
    title: extractBookmarkTitle(title),
    page: coords.pageIndex + 1,
    children: [],
    color,
    style,
    destX: coords.destX,
    destY: coords.destY,
    zoom: coords.zoom,
  };

  const firstRef = itemObj.lookup(PDFName.of("First"));
  let child = firstRef ? resolveRefFn(doc, firstRef) : null;
  while (child) {
    const childObj = child as PDFObjectWithLookup | null;
    if (hasLookup(childObj)) {
      const childBookmark = traverseBookmarkTree(
        childObj,
        doc,
        pages,
        namedDests,
        resolveRefFn
      );
      if (childBookmark) bookmark.children.push(childBookmark);
      const nextRef = childObj.lookup(PDFName.of("Next"));
      child = nextRef ? resolveRefFn(doc, nextRef) : null;
    } else {
      break;
    }
  }

  if (coords.pageIndex === 0 && bookmark.children.length > 0) {
    const firstChild = bookmark.children[0];
    if (firstChild) {
      bookmark.page = firstChild.page;
      bookmark.destX = firstChild.destX;
      bookmark.destY = firstChild.destY;
      bookmark.zoom = firstChild.zoom;
    }
  }

  return bookmark;
};

export const extractExistingBookmarks = async (
  doc: PDFDocument
): Promise<BookmarkNode[]> => {
  try {
    const pages = doc.getPages();

    const outlinesRef = doc.catalog.lookup(PDFName.of("Outlines"));
    if (!outlinesRef) return [];

    const outlines = resolveRef(doc, outlinesRef) as PDFObjectWithLookup | null;
    if (!hasLookup(outlines)) return [];

    const namedDests = buildNamedDestinations(doc, resolveRef);

    const result: BookmarkNode[] = [];
    const firstRef = outlines.lookup(PDFName.of("First"));
    let first = firstRef
      ? (resolveRef(doc, firstRef) as PDFObjectWithLookup | null)
      : null;

    while (first && hasLookup(first)) {
      const bookmark = traverseBookmarkTree(
        first,
        doc,
        pages,
        namedDests,
        resolveRef
      );
      if (bookmark) result.push(bookmark);
      const nextRef = first.lookup(PDFName.of("Next"));
      first = nextRef
        ? (resolveRef(doc, nextRef) as PDFObjectWithLookup | null)
        : null;
    }

    return result;
  } catch (err) {
    console.error("Error extracting bookmarks:", err);
    return [];
  }
};
