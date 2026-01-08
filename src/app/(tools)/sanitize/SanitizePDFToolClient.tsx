"use client";

import dynamic from "next/dynamic";

const SanitizePDFTool = dynamic(
  () =>
    import("@/features/sanitize-pdf").then((mod) => ({
      default: mod.SanitizePDFTool,
    })),
  {
    ssr: false,
  },
);

export default function SanitizePDFToolClient() {
  return <SanitizePDFTool />;
}
