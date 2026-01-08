"use client";

import dynamic from "next/dynamic";

const PdfToJpgTool = dynamic(
  () =>
    import("@/features/pdf-to-jpg").then((mod) => ({
      default: mod.PdfToJpgTool,
    })),
  { ssr: false },
);

export default function PdfToJpgToolClient() {
  return <PdfToJpgTool />;
}
