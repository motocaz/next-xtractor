import { ScrollToTop } from "@/components/ScrollToTop";
import { DeletePagesTool } from "@/features/pdf-delete-pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Pages | Xtractor",
  description:
    "Remove specific pages from your PDF document. Enter page numbers or ranges to delete unwanted pages.",
};

export default function DeletePagesPage() {
  return (
    <>
      <ScrollToTop />
      <DeletePagesTool />
    </>
  );
}
