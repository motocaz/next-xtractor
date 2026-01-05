'use client';

import dynamic from 'next/dynamic';

const SplitPDFTool = dynamic(
  () =>
    import('@/features/pdf-split').then((mod) => ({
      default: mod.SplitPDFTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading Split PDF Tool...</p>
        </div>
      </div>
    ),
  }
);

export default SplitPDFTool;

