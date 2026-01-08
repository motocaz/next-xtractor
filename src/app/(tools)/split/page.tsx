import { ScrollToTop } from "@/components/ScrollToTop";
import SplitPDFToolClient from "./SplitPDFToolClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF | Xtractor",
  description:
    "Extract pages from your PDF using various methods: page ranges, visual selection, bookmarks, or split into chunks.",
};

export default function SplitPage() {
  return (
    <>
      <ScrollToTop />
      <SplitPDFToolClient />
    </>
  );
}
