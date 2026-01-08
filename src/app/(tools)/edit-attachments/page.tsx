"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const EditAttachmentsTool = dynamic(
  () =>
    import("@/features/pdf-edit-attachments").then((mod) => ({
      default: mod.EditAttachmentsTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading Edit Attachments Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function EditAttachmentsPage() {
  return (
    <>
      <ScrollToTop />
      <EditAttachmentsTool />
    </>
  );
}
