import Image from "next/image";
import { Shield } from "lucide-react";
import { MarkerSlanted } from "@/components/ui/marker-slanted";

interface ComplianceItem {
  image: string;
  alt: string;
  title: string;
  description: string;
}

const complianceItems: ComplianceItem[] = [
  {
    image: "/images/gdpr.svg",
    alt: "GDPR compliance",
    title: "GDPR compliance",
    description:
      "Protects the personal data and privacy of individuals within the European Union.",
  },
  {
    image: "/images/ccpa.svg",
    alt: "CCPA compliance",
    title: "CCPA compliance",
    description:
      "Gives California residents rights over how their personal information is collected, used, and shared.",
  },
  {
    image: "/images/hipaa.svg",
    alt: "HIPAA compliance",
    title: "HIPAA compliance",
    description:
      "Sets safeguards for handling sensitive health information in the United States healthcare system.",
  },
];

export function SecurityComplianceSection() {
  return (
    <section className="py-20">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 text-balance">
          Your data never leaves your device
          <span className="inline-flex items-center gap-4 ml-4">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-fuchsia-400 bg-fuchsia-900 rounded-lg p-1.5" />
            We keep
          </span>
          <br className="hidden sm:block" />
          <span className="inline-block border-2 border-fuchsia-400 bg-fuchsia-900 text-fuchsia-300 px-4 py-2 rounded-full mx-2 text-2xl md:text-3xl lg:text-4xl font-bold">
            your information safe
          </span>
          by following global security standards.
        </h2>
      </div>
      <div className="mb-16 text-center">
        <span className="inline-flex items-center gap-2 text-fuchsia-400 text-lg font-medium transition-colors">
          All the processing happens locally on your device.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
        {complianceItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <Image
                src={item.image}
                alt={item.alt}
                width={96}
                height={96}
                className="w-full h-full"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xs">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

