'use client';

import dynamic from 'next/dynamic';

const PdfToPngTool = dynamic(
  () => import('@/features/pdf-to-png').then((mod) => ({ default: mod.PdfToPngTool })),
  { ssr: false }
);

export default function PdfToPngToolClient() {
  return <PdfToPngTool />;
}

