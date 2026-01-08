import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import RedactPDFToolClient from "./RedactPDFToolClient";

export const metadata: Metadata = {
  title: "Redact PDF | Xtractor",
  description: "Permanently black out sensitive content from your PDFs.",
};

export default function RedactPage() {
  return (
    <>
      <ScrollToTop />
      <RedactPDFToolClient />
    </>
  );
}
