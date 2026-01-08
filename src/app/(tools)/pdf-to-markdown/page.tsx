import { ScrollToTop } from "@/components/ScrollToTop";
import PdfToMarkdownToolClient from "./PdfToMarkdownToolClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Markdown | Xtractor",
  description: "Convert a PDF's text content into a structured Markdown file.",
};

export default function PdfToMarkdownPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToMarkdownToolClient />
    </>
  );
}
