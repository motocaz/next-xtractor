"use client";

import dynamic from "next/dynamic";

const PdfToGreyscaleTool = dynamic(
  () =>
    import("@/features/pdf-to-greyscale").then((mod) => ({
      default: mod.PdfToGreyscaleTool,
    })),
  { ssr: false },
);

export default function PdfToGreyscaleToolClient() {
  return <PdfToGreyscaleTool />;
}
