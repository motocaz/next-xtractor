"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const ViewMetadataTool = dynamic(
  () =>
    import("@/features/view-metadata").then((mod) => ({
      default: mod.ViewMetadataTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading View Metadata Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function ViewMetadataPage() {
  return (
    <>
      <ScrollToTop />
      <ViewMetadataTool />
    </>
  );
}
