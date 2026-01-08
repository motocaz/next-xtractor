"use client";

import dynamic from "next/dynamic";

const InvertColorsTool = dynamic(
  () =>
    import("@/features/invert-colors").then((mod) => ({
      default: mod.InvertColorsTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Invert Colors Tool...</p>
        </div>
      </div>
    ),
  },
);

export default InvertColorsTool;
