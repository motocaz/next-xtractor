"use client";

import dynamic from "next/dynamic";

const HeicToPdfTool = dynamic(
  () =>
    import("@/features/heic-to-pdf").then((mod) => ({
      default: mod.HeicToPdfTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading HEIC to PDF Tool...</p>
        </div>
      </div>
    ),
  },
);

export default HeicToPdfTool;
