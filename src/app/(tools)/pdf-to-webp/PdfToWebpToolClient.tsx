"use client";

import dynamic from "next/dynamic";

const PdfToWebpTool = dynamic(
  () =>
    import("@/features/pdf-to-webp").then((mod) => ({
      default: mod.PdfToWebpTool,
    })),
  { ssr: false },
);

export default function PdfToWebpToolClient() {
  return <PdfToWebpTool />;
}
