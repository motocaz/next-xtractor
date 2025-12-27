import { PDFName } from "pdf-lib";
import type { PDFDocument } from "pdf-lib";
import type { BookmarkNode } from "../types";

export const extractExistingBookmarks = async (
  doc: PDFDocument
): Promise<BookmarkNode[]> => {
  try {
    const pages = doc.getPages();

    type PDFObjectWithLookup = {
      lookup: (name: ReturnType<typeof PDFName.of>) => unknown;
      [key: string]: unknown;
    };

    const resolveRef = (obj: unknown): unknown => {
      if (!obj) return null;
      if (
        obj &&
        typeof obj === "object" &&
        "lookup" in obj &&
        typeof (obj as PDFObjectWithLookup).lookup === "function"
      ) {
        return obj;
      }
      if (
        obj &&
        typeof obj === "object" &&
        "objectNumber" in obj &&
        doc.context
      ) {
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

    const outlinesRef = doc.catalog.lookup(PDFName.of("Outlines"));
    if (!outlinesRef) return [];
    const outlines = resolveRef(outlinesRef) as PDFObjectWithLookup | null;
    if (!outlines || typeof outlines.lookup !== "function") return [];

    const namedDests = new Map<string, unknown>();
    try {
      const addNamePair = (nameObj: unknown, destObj: unknown): void => {
        if (!nameObj || !destObj) return;

        try {
          let key: string;
          if (
            typeof nameObj === "object" &&
            "decodeText" in nameObj &&
            typeof nameObj.decodeText === "function"
          ) {
            key = nameObj.decodeText();
          } else {
            key = String(nameObj);
          }

          if (key) {
            const resolvedDest = resolveRef(destObj);
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
        const resolved = resolveRef(node);
        if (!resolved) return;

        const resolvedNode = resolved as PDFObjectWithLookup | null;
        if (resolvedNode && typeof resolvedNode.lookup === "function") {
          const namesArray = resolvedNode.lookup(PDFName.of("Names"));
          if (
            namesArray &&
            typeof namesArray === "object" &&
            "array" in namesArray &&
            Array.isArray((namesArray as { array: unknown[] }).array)
          ) {
            const arr = (namesArray as { array: unknown[] }).array;
            for (let i = 0; i < arr.length; i += 2) {
              const n = arr[i];
              const d = arr[i + 1];
              addNamePair(n, d);
            }
          }

          const kidsArray = resolvedNode.lookup(PDFName.of("Kids"));
          if (
            kidsArray &&
            typeof kidsArray === "object" &&
            "array" in kidsArray &&
            Array.isArray((kidsArray as { array: unknown[] }).array)
          ) {
            const arr = (kidsArray as { array: unknown[] }).array;
            for (const kid of arr) traverseNamesNode(kid);
          }
        }
      };

      const names = doc.catalog.lookup(PDFName.of("Names"));
      if (names) {
        const resolvedNames = resolveRef(names) as PDFObjectWithLookup | null;
        if (resolvedNames && typeof resolvedNames.lookup === "function") {
          const destsTree = resolvedNames.lookup(PDFName.of("Dests"));
          if (destsTree) traverseNamesNode(destsTree);
        }
      }

      const catalogDests = doc.catalog.lookup(PDFName.of("Dests"));
      if (catalogDests) {
        const resolvedDests = resolveRef(catalogDests);
        if (
          resolvedDests &&
          typeof resolvedDests === "object" &&
          "dict" in resolvedDests &&
          resolvedDests.dict &&
          typeof resolvedDests.dict === "object" &&
          "entries" in resolvedDests.dict &&
          typeof resolvedDests.dict.entries === "function"
        ) {
          const entries = (
            resolvedDests.dict as {
              entries: () => Iterable<[unknown, unknown]>;
            }
          ).entries();
          for (const [key, value] of entries) {
            const keyStr =
              key &&
              typeof key === "object" &&
              "decodeText" in key &&
              typeof (key as { decodeText: () => string }).decodeText ===
                "function"
                ? (key as { decodeText: () => string }).decodeText()
                : String(key);
            namedDests.set(keyStr, resolveRef(value));
          }
        }
      }
    } catch (e) {
      console.error("Error building named destinations:", e);
    }

    const findPageIndex = (pageRef: unknown): number => {
      if (!pageRef) return 0;

      try {
        const resolved = resolveRef(pageRef);

        if (
          pageRef &&
          typeof pageRef === "object" &&
          "numberValue" in pageRef &&
          typeof pageRef.numberValue === "number"
        ) {
          const numericIndex = pageRef.numberValue | 0;
          if (numericIndex >= 0 && numericIndex < pages.length)
            return numericIndex;
        }

        if (
          pageRef &&
          typeof pageRef === "object" &&
          "objectNumber" in pageRef &&
          typeof pageRef.objectNumber === "number"
        ) {
          const idxByObjNum = pages.findIndex(
            (p) => p.ref.objectNumber === pageRef.objectNumber
          );
          if (idxByObjNum !== -1) return idxByObjNum;
        }

        if (
          pageRef &&
          typeof pageRef === "object" &&
          "toString" in pageRef &&
          typeof pageRef.toString === "function"
        ) {
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
          } catch {}
        }
      } catch (e) {
        console.error("Error finding page:", e);
      }

      console.warn("Falling back to page 0 for destination");
      return 0;
    };

    const getDestination = (item: unknown): unknown => {
      if (!item) return null;

      const itemObj = item as PDFObjectWithLookup | null;
      if (!itemObj || typeof itemObj.lookup !== "function") {
        return null;
      }

      let dest = itemObj.lookup(PDFName.of("Dest"));

      if (!dest) {
        const actionRef = itemObj.lookup(PDFName.of("A"));
        const action = resolveRef(actionRef) as PDFObjectWithLookup | null;
        if (action && typeof action.lookup === "function") {
          dest = action.lookup(PDFName.of("D"));
        }
      }

      if (dest && (typeof dest !== "object" || !("array" in dest))) {
        try {
          const name =
            dest &&
            typeof dest === "object" &&
            "decodeText" in dest &&
            typeof (dest as { decodeText: () => string }).decodeText ===
              "function"
              ? (dest as { decodeText: () => string }).decodeText()
              : String(dest);
          if (namedDests.has(name)) {
            dest = namedDests.get(name);
          } else if (
            dest &&
            typeof dest === "object" &&
            "lookup" in dest &&
            typeof (dest as PDFObjectWithLookup).lookup === "function"
          ) {
            const maybeDict = resolveRef(dest) as PDFObjectWithLookup | null;
            const dictD =
              maybeDict && typeof maybeDict.lookup === "function"
                ? maybeDict.lookup(PDFName.of("D"))
                : null;
            if (dictD) dest = resolveRef(dictD);
          }
        } catch {}
      }

      return resolveRef(dest);
    };

    const traverse = (item: unknown): BookmarkNode | null => {
      if (!item) return null;
      const resolvedItem = resolveRef(item);
      if (!resolvedItem) return null;

      const itemObj = resolvedItem as PDFObjectWithLookup | null;
      if (!itemObj || typeof itemObj.lookup !== "function") {
        return null;
      }

      const title = itemObj.lookup(PDFName.of("Title"));
      const dest = getDestination(itemObj);
      const colorObj = itemObj.lookup(PDFName.of("C"));
      const flagsObj = itemObj.lookup(PDFName.of("F"));

      let pageIndex = 0;
      let destX: number | null = null;
      let destY: number | null = null;
      let zoom: string | null = null;

      if (
        dest &&
        typeof dest === "object" &&
        "array" in dest &&
        Array.isArray(dest.array)
      ) {
        const pageRef = dest.array[0];
        pageIndex = findPageIndex(pageRef);

        if (dest.array.length > 2) {
          const xObj = resolveRef(dest.array[2]);
          const yObj = resolveRef(dest.array[3]);
          const zoomObj = resolveRef(dest.array[4]);

          if (
            xObj &&
            typeof xObj === "object" &&
            "numberValue" in xObj &&
            typeof xObj.numberValue === "number"
          ) {
            destX = xObj.numberValue;
          }
          if (
            yObj &&
            typeof yObj === "object" &&
            "numberValue" in yObj &&
            typeof yObj.numberValue === "number"
          ) {
            destY = yObj.numberValue;
          }
          if (
            zoomObj &&
            typeof zoomObj === "object" &&
            "numberValue" in zoomObj &&
            typeof zoomObj.numberValue === "number"
          ) {
            zoom = String(Math.round(zoomObj.numberValue * 100));
          }
        }
      }

      let color: string | null = null;
      if (
        colorObj &&
        typeof colorObj === "object" &&
        "array" in colorObj &&
        Array.isArray(colorObj.array) &&
        colorObj.array.length >= 3
      ) {
        const [r, g, b] = colorObj.array as number[];
        if (r > 0.8 && g < 0.3 && b < 0.3) color = "red";
        else if (r < 0.3 && g < 0.3 && b > 0.8) color = "blue";
        else if (r < 0.3 && g > 0.8 && b < 0.3) color = "green";
        else if (r > 0.8 && g > 0.8 && b < 0.3) color = "yellow";
        else if (r > 0.5 && g < 0.5 && b > 0.5) color = "purple";
      }

      let style: string | null = null;
      if (
        flagsObj &&
        typeof flagsObj === "object" &&
        "numberValue" in flagsObj
      ) {
        const flags =
          typeof flagsObj.numberValue === "number" ? flagsObj.numberValue : 0;
        const isBold = (flags & 2) !== 0;
        const isItalic = (flags & 1) !== 0;
        if (isBold && isItalic) style = "bold-italic";
        else if (isBold) style = "bold";
        else if (isItalic) style = "italic";
      }

      const bookmark: BookmarkNode = {
        id: String(Date.now() + Math.random()),
        title:
          title &&
          typeof title === "object" &&
          "decodeText" in title &&
          typeof (title as { decodeText: () => string }).decodeText ===
            "function"
            ? (title as { decodeText: () => string }).decodeText()
            : "Untitled",
        page: pageIndex + 1,
        children: [],
        color,
        style,
        destX,
        destY,
        zoom,
      };

      const firstRef = itemObj.lookup(PDFName.of("First"));
      let child = firstRef ? resolveRef(firstRef) : null;
      while (child) {
        const childObj = child as PDFObjectWithLookup | null;
        if (childObj && typeof childObj.lookup === "function") {
          const childBookmark = traverse(childObj);
          if (childBookmark) bookmark.children.push(childBookmark);
          const nextRef = childObj.lookup(PDFName.of("Next"));
          child = nextRef ? resolveRef(nextRef) : null;
        } else {
          break;
        }
      }

      if (pageIndex === 0 && bookmark.children.length > 0) {
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

    const result: BookmarkNode[] = [];
    const firstRef = outlines.lookup(PDFName.of("First"));
    let first = firstRef
      ? (resolveRef(firstRef) as PDFObjectWithLookup | null)
      : null;
    while (first && typeof first.lookup === "function") {
      const bookmark = traverse(first);
      if (bookmark) result.push(bookmark);
      const nextRef = first.lookup(PDFName.of("Next"));
      first = nextRef
        ? (resolveRef(nextRef) as PDFObjectWithLookup | null)
        : null;
    }

    return result;
  } catch (err) {
    console.error("Error extracting bookmarks:", err);
    return [];
  }
};
