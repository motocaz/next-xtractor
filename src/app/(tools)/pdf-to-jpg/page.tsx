import { ScrollToTop } from '@/components/ScrollToTop';
import PdfToJpgToolClient from './PdfToJpgToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG | Xtractor',
  description:
    'Convert each page of a PDF file into a JPG image. Your files will be downloaded in a ZIP archive.',
};

export default function PdfToJpgPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToJpgToolClient />
    </>
  );
}

