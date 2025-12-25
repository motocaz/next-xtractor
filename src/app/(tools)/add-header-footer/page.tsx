import { ScrollToTop } from '@/components/ScrollToTop';
import { AddHeaderFooterTool } from '@/features/add-header-footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Header & Footer to PDF | Xtractor',
  description: 'Add custom text to the top and bottom margins of every page in your PDF document.',
};

export default function AddHeaderFooterPage() {
  return (
    <>
      <ScrollToTop />
      <AddHeaderFooterTool />
    </>
  );
}

