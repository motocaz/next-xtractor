import { ScrollToTop } from '@/components/ScrollToTop';
import { TxtToPdfTool } from '@/features/txt-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text to PDF | Xtractor',
  description:
    'Convert text files or typed text to PDF with custom formatting. Upload one or more text files, or type/paste text directly.',
};

export default function TxtToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <TxtToPdfTool />
    </>
  );
}

