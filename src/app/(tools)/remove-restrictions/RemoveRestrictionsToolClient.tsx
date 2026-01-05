'use client';

import dynamic from 'next/dynamic';

const RemoveRestrictionsTool = dynamic(
  () =>
    import('@/features/remove-restrictions').then((mod) => ({
      default: mod.RemoveRestrictionsTool,
    })),
  {
    ssr: false,
  }
);

export default function RemoveRestrictionsToolClient() {
  return <RemoveRestrictionsTool />;
}

