import { ScrollToTop } from '@/components/ScrollToTop';
import ComparePDFsToolClient from './ComparePDFsToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare PDFs | Xtractor',
  description:
    'Compare two PDFs side by side or in overlay mode. Upload two PDF files to visually compare them and identify differences.',
};

export default function ComparePDFsPage() {
  return (
    <>
      <ScrollToTop />
      <ComparePDFsToolClient />
    </>
  );
}

