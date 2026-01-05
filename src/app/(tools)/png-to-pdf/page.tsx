import { ScrollToTop } from '@/components/ScrollToTop';
import { PngToPdfTool } from '@/features/png-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to PDF | Xtractor',
  description: 'Create a PDF from one or more PNG images. Upload PNG images and create a PDF document with all images as pages.',
};

export default function PngToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <PngToPdfTool />
    </>
  );
}

