"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const EditMetadataTool = dynamic(
  () =>
    import("@/features/pdf-edit-metadata").then((mod) => ({
      default: mod.EditMetadataTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading Edit Metadata Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function EditMetadataPage() {
  return (
    <>
      <ScrollToTop />
      <EditMetadataTool />
    </>
  );
}
