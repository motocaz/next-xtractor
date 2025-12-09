import { Shield, BadgeDollarSign, Infinity as InfinityIcon, Layers, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MarkerSlanted } from "@/components/ui/marker-slanted";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Shield className="w-10 h-10 text-primary shrink-0" />,
    title: "No Uploads",
    description: "100% client-side, your files never leave your device.",
  },
  {
    icon: <BadgeDollarSign className="w-10 h-10 text-primary shrink-0" />,
    title: "Professional Tools",
    description: "All tools, no trials, no paywalls.",
  },
  {
    icon: <InfinityIcon className="w-10 h-10 text-primary shrink-0" />,
    title: "No Limits",
    description: "Use as much as you want, no hidden caps.",
  },
  {
    icon: <Layers className="w-10 h-10 text-primary shrink-0" />,
    title: "Batch Processing",
    description: "Handle unlimited PDFs in one go.",
  },
  {
    icon: <Zap className="w-10 h-10 text-primary shrink-0" />,
    title: "Lightning Fast",
    description: "Process PDFs instantly, without waiting or delays.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        Why <MarkerSlanted>Xtractor?</MarkerSlanted>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <div className="flex items-center gap-4">
              {feature.icon}
              <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
            </div>
            <p className="text-muted-foreground pl-14">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

