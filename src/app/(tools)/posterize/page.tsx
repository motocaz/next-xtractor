import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import PosterizePDFToolClient from "./PosterizePDFToolClient";

export const metadata: Metadata = {
  title: "Posterize PDF | Xtractor",
  description:
    "Split PDF pages into multiple smaller sheets to print as a poster.",
};

export default function PosterizePage() {
  return (
    <>
      <ScrollToTop />
      <PosterizePDFToolClient />
    </>
  );
}
