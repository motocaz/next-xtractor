"use client";

import dynamic from "next/dynamic";

const CombineSinglePageTool = dynamic(
  () =>
    import("@/features/combine-single-page").then((mod) => ({
      default: mod.CombineSinglePageTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Combine Tool...</p>
        </div>
      </div>
    ),
  },
);

export default CombineSinglePageTool;
