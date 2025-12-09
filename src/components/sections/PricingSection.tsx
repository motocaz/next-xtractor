"use client";

import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { MarkerSlanted } from "@/components/ui/marker-slanted";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
        Choose Your <MarkerSlanted>Plan</MarkerSlanted>
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Select the perfect plan for your PDF processing needs
      </p>
      <div className="flex justify-center">
        <PricingTable appearance={clerkAppearance} />
      </div>
      <div className="text-center mt-8">
        <Link href="/pricing">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            View All Plans
          </Button>
        </Link>
      </div>
    </section>
  );
}
