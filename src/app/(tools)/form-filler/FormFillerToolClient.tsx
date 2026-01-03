'use client';

import dynamic from 'next/dynamic';

const FormFillerTool = dynamic(
  () =>
    import('@/features/pdf-form-filler').then((mod) => ({
      default: mod.FormFillerTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Form Filler...</p>
        </div>
      </div>
    ),
  }
);

export default FormFillerTool;

