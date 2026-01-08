"use client";

import dynamic from "next/dynamic";

const PdfToJsonTool = dynamic(
  () =>
    import("@/features/pdf-to-json").then((mod) => ({
      default: mod.PdfToJsonTool,
    })),
  { ssr: false },
);

export default function PdfToJsonToolClient() {
  return <PdfToJsonTool />;
}
