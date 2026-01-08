"use client";

import dynamic from "next/dynamic";

const ChangeTextColorTool = dynamic(
  () =>
    import("@/features/change-text-color").then((mod) => ({
      default: mod.ChangeTextColorTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Text Color Tool...</p>
        </div>
      </div>
    ),
  },
);

export default ChangeTextColorTool;
