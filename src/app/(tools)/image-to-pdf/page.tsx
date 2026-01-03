import { ScrollToTop } from '@/components/ScrollToTop';
import { ImageToPdfTool } from '@/features/image-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image to PDF | Xtractor',
  description: 'Convert JPG, PNG, WebP, SVG, BMP, HEIC, and TIFF images to PDF. Support for single or mixed image types with quality control.',
};

export default function ImageToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <ImageToPdfTool />
    </>
  );
}

