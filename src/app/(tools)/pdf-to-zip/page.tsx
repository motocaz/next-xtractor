import { ScrollToTop } from "@/components/ScrollToTop";
import PdfToZipToolClient from "./PdfToZipToolClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to ZIP | Xtractor",
  description: "Combine multiple PDF files into a single ZIP archive.",
};

export default function PdfToZipPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToZipToolClient />
    </>
  );
}
