import { ScrollToTop } from '@/components/ScrollToTop';
import { WebpToPdfTool } from '@/features/webp-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to PDF | Xtractor',
  description: 'Convert one or more WebP images into a single PDF file. Upload WebP images and create a PDF document with all images as pages.',
};

export default function WebpToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <WebpToPdfTool />
    </>
  );
}

