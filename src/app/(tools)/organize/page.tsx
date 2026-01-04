'use client';

import dynamic from 'next/dynamic';
import { ScrollToTop } from '@/components/ScrollToTop';

const OrganizeTool = dynamic(
  () =>
    import('@/features/pdf-organize').then((mod) => ({
      default: mod.OrganizeTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Organize Tool...</p>
        </div>
      </div>
    ),
  }
);

export default function OrganizePage() {
  return (
    <>
      <ScrollToTop />
      <OrganizeTool />
    </>
  );
}

