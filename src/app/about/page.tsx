import Link from "next/link";
import { Rocket, ShieldCheck, Zap, BadgeDollarSign, UserPlus, Code2 } from "lucide-react";
import { SectionDivider } from "@/components/ui/section-divider";
import { MarkerSlanted } from "@/components/ui/marker-slanted";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/sections/PricingSection";

export default function AboutPage() {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-3xl md:text-6xl font-bold text-white mb-4">
          We believe PDF tools should be{" "}
          <MarkerSlanted>fast and private.</MarkerSlanted>
        </h1>
        <p className="text-lg md:text-xl text-gray-400">No compromises.</p>
      </section>

      <SectionDivider />

      <section className="py-16 max-w-4xl mx-auto">
        <div className="text-center">
          <Rocket className="w-16 h-16 text-fuchsia-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            To provide the most comprehensive PDF toolbox that respects your
            privacy and never asks for payment. We believe essential document
            tools should be accessible to everyone, everywhere, without
            barriers.
          </p>
        </div>
      </section>

      <div className="bg-tool-card rounded-xl p-8 md:p-12 my-16 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="text-fuchsia-400 font-bold uppercase">
              Our Core Philosophy
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Privacy First. Always.
            </h2>
            <p className="text-gray-400 leading-relaxed">
              In an era where data is a commodity, we take a different approach.
              All processing for Xtractor tools happens locally in your browser.
              This means your files never touch our servers, we never see your
              documents, and we don't track what you do. Your documents remain
              completely and unequivocally private. It's not just a feature;
              it's our foundation.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-fuchsia-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-fuchsia-500 rounded-full opacity-30 animate-pulse delay-500"></div>
              <ShieldCheck className="w-48 h-48 text-fuchsia-400 relative z-10" />
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Why <MarkerSlanted>Xtractor?</MarkerSlanted>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="bg-tool-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <Zap className="w-10 h-10 text-fuchsia-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">Built for Speed</h3>
                <p className="text-gray-400 mt-2">
                  No waiting for uploads or downloads to a server. By processing
                  files directly in your browser using modern web technologies
                  like WebAssembly, we offer unparalleled speed for all our tools.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-tool-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <BadgeDollarSign className="w-10 h-10 text-fuchsia-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">Professional Quality</h3>
                <p className="text-gray-400 mt-2">
                  No trials, no subscriptions, no hidden fees, and no "premium"
                  features held hostage. We believe powerful PDF tools should be a
                  public utility, not a profit center.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-tool-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <UserPlus className="w-10 h-10 text-fuchsia-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Secure Authentication
                </h3>
                <p className="text-gray-400 mt-2">
                  Sign in to access all tools securely. Your account ensures your
                  work is saved and your privacy is protected.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-tool-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <Code2 className="w-10 h-10 text-fuchsia-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">Open Source Spirit</h3>
                <p className="text-gray-400 mt-2">
                  Built with transparency in mind. We leverage incredible
                  open-source libraries like PDF-lib and PDF.js, and believe in
                  the community-driven effort to make powerful tools accessible to
                  everyone.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <SectionDivider />

      <PricingSection />

      <SectionDivider />

      <section className="text-center py-16">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust Xtractor for their daily document
          needs. Experience the difference that privacy and performance can
          make.
        </p>
        <Button
          variant="gradient"
          asChild
          className="inline-block px-8 py-3 rounded-full focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-400"
        >
          <Link href="/#tools-header">Explore All Tools</Link>
        </Button>
      </section>
    </div>
  );
}


