'use client';

import dynamic from 'next/dynamic';

const PdfToZipTool = dynamic(
  () => import('@/features/pdf-to-zip').then((mod) => ({ default: mod.PdfToZipTool })),
  { ssr: false }
);

export default function PdfToZipToolClient() {
  return <PdfToZipTool />;
}

