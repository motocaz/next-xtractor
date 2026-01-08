import { ScrollToTop } from "@/components/ScrollToTop";
import { BmpToPdfTool } from "@/features/bmp-to-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMP to PDF | Xtractor",
  description:
    "Convert one or more BMP images into a single PDF file. Upload BMP images and create a PDF document with all images as pages.",
};

export default function BmpToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <BmpToPdfTool />
    </>
  );
}
