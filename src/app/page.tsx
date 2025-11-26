import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { ToolsSection } from "@/components/sections/ToolsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { SecurityComplianceSection } from "@/components/sections/SecurityComplianceSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { SectionDivider } from "@/components/ui/section-divider";

export default function Home() {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <HeroSection />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <ToolsSection />
      <SectionDivider />
      <PricingSection />
      <SectionDivider />
      <SecurityComplianceSection />
      <SectionDivider />
      <FAQSection />
      <SectionDivider />
      <TestimonialsSection />
    </div>
  );
}
