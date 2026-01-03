import { ScrollToTop } from '@/components/ScrollToTop';
import { ExtractPagesTool } from '@/features/extract-pages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Extract Pages from PDF | Xtractor',
  description:
    'Extract specific pages from a PDF document into separate files. All extracted pages are packaged into a ZIP file for easy download.',
};

export default function ExtractPagesPage() {
  return (
    <>
      <ScrollToTop />
      <ExtractPagesTool />
    </>
  );
}

