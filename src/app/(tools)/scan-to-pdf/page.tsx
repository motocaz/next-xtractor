import { ScrollToTop } from '@/components/ScrollToTop';
import { ScanToPdfTool } from '@/features/scan-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scan to PDF | Xtractor',
  description: 'Use your device\'s camera to scan documents and save them as a PDF. On desktop, this will open a file picker.',
};

export default function ScanToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <ScanToPdfTool />
    </>
  );
}

