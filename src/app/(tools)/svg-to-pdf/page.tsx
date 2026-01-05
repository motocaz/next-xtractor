import { ScrollToTop } from '@/components/ScrollToTop';
import { SvgToPdfTool } from '@/features/svg-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SVG to PDF | Xtractor',
  description: 'Create a PDF from one or more SVG images. Upload SVG images and create a PDF document with all images as pages.',
};

export default function SvgToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <SvgToPdfTool />
    </>
  );
}

