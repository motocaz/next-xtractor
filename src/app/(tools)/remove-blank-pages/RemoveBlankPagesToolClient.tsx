'use client';

import dynamic from 'next/dynamic';

const RemoveBlankPagesTool = dynamic(
  () =>
    import('@/features/remove-blank-pages').then((mod) => ({
      default: mod.RemoveBlankPagesTool,
    })),
  {
    ssr: false,
  }
);

export default function RemoveBlankPagesToolClient() {
  return <RemoveBlankPagesTool />;
}

