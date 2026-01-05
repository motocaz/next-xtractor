import type { Metadata } from 'next';
import { ScrollToTop } from '@/components/ScrollToTop';
import PdfToPngToolClient from './PdfToPngToolClient';

export const metadata: Metadata = {
  title: 'PDF to PNG | Xtractor',
  description:
    'Convert each page of a PDF file into a PNG image. Your files will be downloaded in a ZIP archive.',
};

export default function PdfToPngPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToPngToolClient />
    </>
  );
}

