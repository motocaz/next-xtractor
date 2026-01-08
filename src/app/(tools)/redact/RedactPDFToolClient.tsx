"use client";

import dynamic from "next/dynamic";

const RedactPDFTool = dynamic(
  () =>
    import("@/features/pdf-redact").then((mod) => ({
      default: mod.RedactPDFTool,
    })),
  { ssr: false },
);

export default function RedactPDFToolClient() {
  return <RedactPDFTool />;
}
