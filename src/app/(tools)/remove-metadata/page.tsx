import { ScrollToTop } from "@/components/ScrollToTop";
import RemoveMetadataToolClient from "./RemoveMetadataToolClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Metadata | Xtractor",
  description:
    "Completely remove identifying metadata from your PDF for privacy.",
};

export default function RemoveMetadataPage() {
  return (
    <>
      <ScrollToTop />
      <RemoveMetadataToolClient />
    </>
  );
}
