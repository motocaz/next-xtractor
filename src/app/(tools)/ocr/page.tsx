import { ScrollToTop } from "@/components/ScrollToTop";
import { OCRTool } from "@/features/ocr-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF | Xtractor",
  description:
    "Extract text from scanned PDFs and make them searchable. Use OCR to convert scanned documents into searchable PDFs with selectable text.",
};

export const dynamic = "force-dynamic";

export default function OCRPage() {
  return (
    <>
      <ScrollToTop />
      <OCRTool />
    </>
  );
}
