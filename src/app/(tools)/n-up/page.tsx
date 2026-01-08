import { ScrollToTop } from "@/components/ScrollToTop";
import { NUpTool } from "@/features/n-up";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "N-Up PDF | Xtractor",
  description:
    "Combine multiple pages from your PDF onto a single sheet. Great for creating booklets or proof sheets.",
};

export default function NUpPage() {
  return (
    <>
      <ScrollToTop />
      <NUpTool />
    </>
  );
}
