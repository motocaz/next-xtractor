import { PricingTable } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';
import { MarkerSlanted } from '@/components/ui/marker-slanted';

export default function PricingPage() {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Choose Your <MarkerSlanted>Plan</MarkerSlanted>
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Select the perfect plan for your PDF processing needs
        </p>
        <div className="flex justify-center">
          <PricingTable appearance={clerkAppearance} />
        </div>
      </div>
    </div>
  );
}

