import { ScrollToTop } from "@/components/ScrollToTop";
import { RemoveAnnotationsTool } from "@/features/remove-annotations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Annotations | Xtractor",
  description:
    "Remove annotations (highlights, comments, drawings, etc.) from your PDF. Select specific annotation types and pages to clean up your document.",
};

export default function RemoveAnnotationsPage() {
  return (
    <>
      <ScrollToTop />
      <RemoveAnnotationsTool />
    </>
  );
}
