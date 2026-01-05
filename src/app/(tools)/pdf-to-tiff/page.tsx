import type { Metadata } from 'next';
import { ScrollToTop } from '@/components/ScrollToTop';
import PdfToTiffToolClient from './PdfToTiffToolClient';

export const metadata: Metadata = {
  title: 'PDF to TIFF | Xtractor',
  description:
    'Convert each page of a PDF file into a TIFF image. Your files will be downloaded in a ZIP archive.',
};

export default function PdfToTiffPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToTiffToolClient />
    </>
  );
}

