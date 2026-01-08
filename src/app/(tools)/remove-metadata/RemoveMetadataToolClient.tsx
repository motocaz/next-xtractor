"use client";

import dynamic from "next/dynamic";

const RemoveMetadataTool = dynamic(
  () =>
    import("@/features/remove-metadata").then((mod) => ({
      default: mod.RemoveMetadataTool,
    })),
  {
    ssr: false,
  },
);

export default function RemoveMetadataToolClient() {
  return <RemoveMetadataTool />;
}
