"use client";

import dynamic from "next/dynamic";

const PdfToMarkdownTool = dynamic(
  () =>
    import("@/features/pdf-to-markdown").then((mod) => ({
      default: mod.PdfToMarkdownTool,
    })),
  { ssr: false },
);

export default function PdfToMarkdownToolClient() {
  return <PdfToMarkdownTool />;
}
