import { ScrollToTop } from '@/components/ScrollToTop';
import { JpgToPdfTool } from '@/features/jpg-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PDF | Xtractor',
  description: 'Create a PDF from one or more JPG images. Upload JPG images and create a PDF document with all images as pages.',
};

export default function JpgToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <JpgToPdfTool />
    </>
  );
}

