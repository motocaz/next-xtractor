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
        <h1 className="text-3xl md:text-6xl font-bold text-foreground mb-4">
          We believe PDF tools should be{" "}
          <MarkerSlanted>fast and private.</MarkerSlanted>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">No compromises.</p>
      </section>

      <SectionDivider />

      <section className="py-16 max-w-4xl mx-auto">
        <div className="text-center">
          <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            To provide a comprehensive PDF toolbox that respects your
            privacy. We believe essential document tools should be free and
            accessible to everyone, with premium features available for those
            who need advanced capabilities.
          </p>
        </div>
      </section>

      <div className="bg-card rounded-xl p-8 md:p-12 my-16 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="text-primary font-bold uppercase">
              Our Core Philosophy
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Privacy First. Always.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
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
              <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-primary rounded-full opacity-30 animate-pulse delay-500"></div>
              <ShieldCheck className="w-48 h-48 text-primary relative z-10" />
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Why <MarkerSlanted>Xtractor?</MarkerSlanted>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <Zap className="w-10 h-10 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Built for Speed</h3>
                <p className="text-muted-foreground mt-2">
                  No waiting for uploads or downloads to a server. By processing
                  files directly in your browser using modern web technologies
                  like WebAssembly, we offer unparalleled speed for all our tools.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <BadgeDollarSign className="w-10 h-10 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Professional Quality</h3>
                <p className="text-muted-foreground mt-2">
                  Core tools are free forever. Premium features available for
                  subscribers who need advanced capabilities. We believe essential
                  PDF tools should be accessible to everyone.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <UserPlus className="w-10 h-10 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Secure Authentication
                </h3>
                <p className="text-muted-foreground mt-2">
                  Sign in to access all tools securely. Your account saves
                  preferences and subscription status while all file processing
                  remains local and private.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <Code2 className="w-10 h-10 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Open Source Spirit</h3>
                <p className="text-muted-foreground mt-2">
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
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust Xtractor for their daily document
          needs. Experience the difference that privacy and performance can
          make.
        </p>
        <Button
          variant="gradient"
          asChild
          className="inline-block px-8 py-3 rounded-full focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
        >
          <Link href="/#tools-header">Explore All Tools</Link>
        </Button>
      </section>
    </div>
  );
}


