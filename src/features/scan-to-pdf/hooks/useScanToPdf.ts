"use client";

import { useImageToPdf } from "@/features/image-to-pdf";
import type { UseImageToPdfReturn } from "../types";

export const useScanToPdf = (): UseImageToPdfReturn => {
  return useImageToPdf();
};
