"use client";

import { usePageOrganizer } from "@/hooks/usePageOrganizer";
import type { UseOrganizePagesReturn } from "../types";

export const useOrganizePages = (): UseOrganizePagesReturn => {
  return usePageOrganizer({ allowDuplicate: true }) as UseOrganizePagesReturn;
};
