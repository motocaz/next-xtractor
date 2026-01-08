import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PdfToBmpTool } from "@/features/pdf-to-bmp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PDF to BMP | Xtractor",
  description:
    "Convert each page of a PDF file into a BMP image. Your files will be downloaded in a ZIP archive.",
};

export default function PdfToBmpPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToBmpTool />
    </>
  );
}
