"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const ReversePagesTool = dynamic(
  () =>
    import("@/features/reverse-pages").then((mod) => ({
      default: mod.ReversePagesTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading Reverse Pages Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function ReversePagesPage() {
  return (
    <>
      <ScrollToTop />
      <ReversePagesTool />
    </>
  );
}
