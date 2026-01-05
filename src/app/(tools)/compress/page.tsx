import { ScrollToTop } from '@/components/ScrollToTop';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const CompressPDFTool = dynamic(
  () =>
    import('@/features/pdf-compress').then((mod) => ({
      default: mod.CompressPDFTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Compression Tool...</p>
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Compress PDF | Xtractor',
  description: 'Reduce the file size of your PDF documents while maintaining quality.',
};

export default function CompressPDFPage() {
  return (
    <>
      <ScrollToTop />
      <CompressPDFTool />
    </>
  );
}

