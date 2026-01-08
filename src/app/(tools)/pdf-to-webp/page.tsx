import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import PdfToWebpToolClient from "./PdfToWebpToolClient";

export const metadata: Metadata = {
  title: "PDF to WebP | Xtractor",
  description:
    "Convert each page of a PDF file into a WebP image. Your files will be downloaded in a ZIP archive.",
};

export default function PdfToWebpPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToWebpToolClient />
    </>
  );
}
