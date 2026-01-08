import { ScrollToTop } from "@/components/ScrollToTop";
import InvertColorsToolClient from "./InvertColorsToolClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invert Colors | Xtractor",
  description:
    "Convert your PDF to a dark mode version by inverting all colors. Perfect for better readability.",
};

export default function InvertColorsPage() {
  return (
    <>
      <ScrollToTop />
      <InvertColorsToolClient />
    </>
  );
}
