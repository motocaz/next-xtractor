import { ScrollToTop } from "@/components/ScrollToTop";
import { MdToPdfTool } from "@/features/md-to-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown to PDF | Xtractor",
  description:
    "Convert Markdown text to a high-quality PDF document. Write in Markdown, select your formatting options, and get a professional multi-page PDF.",
};

export default function MdToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <MdToPdfTool />
    </>
  );
}
