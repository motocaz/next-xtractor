import { ScrollToTop } from "@/components/ScrollToTop";
import RemoveRestrictionsToolClient from "./RemoveRestrictionsToolClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Restrictions | Xtractor",
  description:
    "Remove security restrictions and unlock PDF permissions for editing and printing.",
};

export default function RemoveRestrictionsPage() {
  return (
    <>
      <ScrollToTop />
      <RemoveRestrictionsToolClient />
    </>
  );
}
