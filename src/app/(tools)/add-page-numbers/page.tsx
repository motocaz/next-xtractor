import { ScrollToTop } from "@/components/ScrollToTop";
import { AddPageNumbersTool } from "@/features/add-page-numbers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF | Xtractor",
  description:
    "Add customizable page numbers to your PDF document with options for position, font size, format, and color.",
};

export default function AddPageNumbersPage() {
  return (
    <>
      <ScrollToTop />
      <AddPageNumbersTool />
    </>
  );
}
