'use client';

import dynamic from 'next/dynamic';

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

export default CompressPDFTool;

