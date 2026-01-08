import { ScrollToTop } from "@/components/ScrollToTop";
import { TiffToPdfTool } from "@/features/tiff-to-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TIFF to PDF | Xtractor",
  description:
    "Convert one or more TIFF images into a single PDF file. Supports multi-page TIFF files.",
};

export default function TiffToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <TiffToPdfTool />
    </>
  );
}
