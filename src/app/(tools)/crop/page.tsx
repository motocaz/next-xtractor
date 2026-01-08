"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const CropPDFTool = dynamic(
  () =>
    import("@/features/pdf-crop").then((mod) => ({
      default: mod.CropPDFTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Crop Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function CropPage() {
  return (
    <>
      <ScrollToTop />
      <CropPDFTool />
    </>
  );
}
