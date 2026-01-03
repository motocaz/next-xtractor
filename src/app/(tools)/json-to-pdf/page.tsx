import { ScrollToTop } from '@/components/ScrollToTop';
import { JsonToPdfTool } from '@/features/json-to-pdf';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON to PDF | Xtractor',
  description: 'Convert JSON files (from PDF-to-JSON) back to PDF format. Upload multiple JSON files and download them as a ZIP archive.',
};

export default function JsonToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <JsonToPdfTool />
    </>
  );
}

