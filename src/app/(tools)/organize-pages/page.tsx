"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";

const OrganizePagesTool = dynamic(
  () =>
    import("@/features/pdf-organize-pages").then((mod) => ({
      default: mod.OrganizePagesTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Organize Tool...</p>
        </div>
      </div>
    ),
  },
);

export default function OrganizePagesPage() {
  return (
    <>
      <ScrollToTop />
      <OrganizePagesTool />
    </>
  );
}
