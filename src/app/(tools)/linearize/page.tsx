import { ScrollToTop } from '@/components/ScrollToTop';
import { LinearizePDFTool } from '@/features/pdf-linearize';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linearize PDFs (Fast Web View) | Xtractor',
  description:
    'Optimize multiple PDFs for faster loading over the web. Files will be downloaded in a ZIP archive.',
};

export default function LinearizePage() {
  return (
    <>
      <ScrollToTop />
      <LinearizePDFTool />
    </>
  );
}

