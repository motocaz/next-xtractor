import Link from "next/link";
import { CheckCircle, Infinity as InfinityIcon } from "lucide-react";
import { MarkerSlanted } from "@/components/ui/marker-slanted";

export function HeroSection() {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl md:text-7xl font-bold text-white mb-4">
        The <MarkerSlanted> PDF Toolkit </MarkerSlanted> built for privacy
        <span className="text-4xl md:text-6xl text-transparent bg-clip-text bg-linear-to-r to-fuchsia-400 to-fuchsia-500">
          .
        </span>
      </h1>
      <p className="text-lg text-gray-400 mb-8">Fast, Secure and Professional.</p>
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tool-card/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-medium backdrop-blur-sm">
          <CheckCircle className="w-4 h-4" />
          Unlimited Use
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tool-card/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-medium backdrop-blur-sm">
          <InfinityIcon className="w-4 h-4" />
          Works Offline
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Link
          href="#tools-header"
          className="inline-block px-8 py-3 rounded-full bg-fuchsia-400 text-white font-semibold focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-400 hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-200 transform hover:-translate-y-1"
        >
          Start Using Xtractor
        </Link>
      </div>
    </section>
  );
}

