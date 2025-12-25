import { ScrollToTop } from '@/components/ScrollToTop';
import { AlternateMergeTool } from '@/features/alternate-merge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alternate Merge PDFs | Xtractor',
  description: 'Alternate and mix pages from multiple PDF files. Upload multiple PDFs and arrange their order to create a merged document with interleaved pages.',
};

export default function AlternateMergePage() {
  return (
    <>
      <ScrollToTop />
      <AlternateMergeTool />
    </>
  );
}

