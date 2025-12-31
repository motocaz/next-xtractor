import type { BookmarkNode } from "../types";
import { downloadFile } from "@/lib/pdf/file-utils";

export const flattenBookmarks = (
  nodes: BookmarkNode[],
  level = 0
): Array<BookmarkNode & { level: number }> => {
  let result: Array<BookmarkNode & { level: number }> = [];
  for (const node of nodes) {
    result.push({ ...node, level });
    if (node.children.length > 0) {
      result = result.concat(flattenBookmarks(node.children, level + 1));
    }
  }
  return result;
};

export const exportToCSV = (
  bookmarkTree: BookmarkNode[],
  originalFileName: string
): void => {
  if (bookmarkTree.length === 0) {
    throw new Error("No bookmarks to export!");
  }

  const flat = flattenBookmarks(bookmarkTree);
  const csv =
    "title,page,level\n" +
    flat
      .map((b) => `"${b.title.replaceAll('"', '""')}",${b.page},${b.level}`)
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const now = new Date().toISOString();
  downloadFile(blob, originalFileName, `${now}-${originalFileName}.csv`);
};

export const exportToJSON = (
  bookmarkTree: BookmarkNode[],
  originalFileName: string
): void => {
  if (bookmarkTree.length === 0) {
    throw new Error("No bookmarks to export!");
  }

  const json = JSON.stringify(bookmarkTree, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const now = new Date().toISOString();
  downloadFile(blob, originalFileName, `${now}_${originalFileName}.json`);
};
