'use client';

import { usePageOrganizer } from '@/hooks/usePageOrganizer';
import type { UseOrganizeReturn } from '../types';

export const useOrganize = (): UseOrganizeReturn => {
  return usePageOrganizer({ allowDuplicate: false }) as UseOrganizeReturn;
};
