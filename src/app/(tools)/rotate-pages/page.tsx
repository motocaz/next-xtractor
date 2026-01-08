"use client";

import { ScrollToTop } from "@/components/ScrollToTop";
import dynamic from "next/dynamic";

const RotatePagesTool = dynamic(
  () =>
    import("@/features/rotate-pages").then((mod) => ({
      default: mod.RotatePagesTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading Rotate Pages Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function RotatePagesPage() {
  return (
    <>
      <ScrollToTop />
      <RotatePagesTool />
    </>
  );
}
