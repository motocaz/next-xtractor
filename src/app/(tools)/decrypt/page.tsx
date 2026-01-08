import { ScrollToTop } from "@/components/ScrollToTop";
import { DecryptPDFTool } from "@/features/pdf-decrypt";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decrypt PDF | Xtractor",
  description:
    "Remove password protection from your encrypted PDF documents. Upload an encrypted PDF and provide its password to create an unlocked version.",
};

export default function DecryptPage() {
  return (
    <>
      <ScrollToTop />
      <DecryptPDFTool />
    </>
  );
}
