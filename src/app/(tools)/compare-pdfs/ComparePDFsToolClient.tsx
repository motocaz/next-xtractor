'use client';

import dynamic from 'next/dynamic';

const ComparePDFsTool = dynamic(
  () =>
    import('@/features/compare-pdfs').then((mod) => ({
      default: mod.ComparePDFsTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Comparison Tool...</p>
        </div>
      </div>
    ),
  }
);

export default ComparePDFsTool;

