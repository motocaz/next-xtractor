'use client';

import dynamic from 'next/dynamic';

const PosterizePDFTool = dynamic(
  () => import('@/features/pdf-posterize').then((mod) => ({ default: mod.PosterizePDFTool })),
  { ssr: false }
);

export default function PosterizePDFToolClient() {
  return <PosterizePDFTool />;
}

