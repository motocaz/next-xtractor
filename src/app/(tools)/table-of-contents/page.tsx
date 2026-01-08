import { ScrollToTop } from "@/components/ScrollToTop";
import { TableOfContentsTool } from "@/features/table-of-contents";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table of Contents | Xtractor",
  description:
    "Generate a table of contents page from PDF bookmarks. Upload a PDF with bookmarks and create a formatted table of contents page.",
};

export default function TableOfContentsPage() {
  return (
    <>
      <ScrollToTop />
      <TableOfContentsTool />
    </>
  );
}
