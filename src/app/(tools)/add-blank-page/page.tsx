import { ScrollToTop } from "@/components/ScrollToTop";
import { AddBlankPageTool } from "@/features/add-blank-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Blank Pages to PDF | Xtractor",
  description:
    "Insert one or more blank pages at a specific position in your PDF document.",
};

export default function AddBlankPagePage() {
  return (
    <>
      <ScrollToTop />
      <AddBlankPageTool />
    </>
  );
}
