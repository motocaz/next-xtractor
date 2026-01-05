'use client';

import dynamic from 'next/dynamic';

const SplitInHalfTool = dynamic(
  () =>
    import('@/features/split-in-half').then((mod) => ({
      default: mod.SplitInHalfTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading Split in Half Tool...</p>
        </div>
      </div>
    ),
  }
);

export default SplitInHalfTool;

