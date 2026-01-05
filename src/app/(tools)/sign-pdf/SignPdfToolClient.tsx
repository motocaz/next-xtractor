'use client';

import dynamic from 'next/dynamic';

const SignPdfTool = dynamic(
  () => import('@/features/sign-pdf').then((mod) => ({ default: mod.SignPdfTool })),
  { ssr: false }
);

export default function SignPdfToolClient() {
  return <SignPdfTool />;
}

