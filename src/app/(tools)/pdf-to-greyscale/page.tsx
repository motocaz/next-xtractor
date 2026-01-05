import { ScrollToTop } from '@/components/ScrollToTop';
import PdfToGreyscaleToolClient from './PdfToGreyscaleToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Greyscale | Xtractor',
  description:
    'Convert a color PDF into a black-and-white version. This is done by rendering each page, applying a greyscale filter, and rebuilding the PDF.',
};

export default function PdfToGreyscalePage() {
  return (
    <>
      <ScrollToTop />
      <PdfToGreyscaleToolClient />
    </>
  );
}

