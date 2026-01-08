import { ScrollToTop } from "@/components/ScrollToTop";
import { WordToPdfTool } from "@/features/word-to-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF | Xtractor",
  description:
    "Convert Word documents (.docx) to PDF format. Upload a Word document and preview it before downloading as PDF.",
};

export default function WordToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <WordToPdfTool />
    </>
  );
}
