import { ScrollToTop } from '@/components/ScrollToTop';
import PdfToJsonToolClient from './PdfToJsonToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JSON | Xtractor',
  description:
    'Convert PDF files to JSON format. Files will be downloaded as a ZIP archive.',
};

export default function PdfToJsonPage() {
  return (
    <>
      <ScrollToTop />
      <PdfToJsonToolClient />
    </>
  );
}

