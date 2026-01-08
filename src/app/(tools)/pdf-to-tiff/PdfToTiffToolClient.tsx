"use client";

import dynamic from "next/dynamic";

const PdfToTiffTool = dynamic(
  () =>
    import("@/features/pdf-to-tiff").then((mod) => ({
      default: mod.PdfToTiffTool,
    })),
  { ssr: false },
);

export default function PdfToTiffToolClient() {
  return <PdfToTiffTool />;
}
