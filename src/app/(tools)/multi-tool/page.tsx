"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const MultiToolTool = dynamic(
  () =>
    import("@/features/pdf-multi-tool").then((mod) => ({
      default: mod.MultiToolTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Multi-Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function MultiToolPage() {
  return (
    <>
      <ScrollToTop />
      <MultiToolTool />
    </>
  );
}
