import { FileText } from "lucide-react";
import { MarkerSlanted } from "@/components/ui/marker-slanted";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-4">
          The <MarkerSlanted> PDF Toolkit </MarkerSlanted> built for
          privacy<span className="text-4xl md:text-6xl text-fuchsia-400">
            .
          </span>
        </h1>
        <p className="text-lg text-gray-400 mb-8">Fast, Secure and Professional.</p>
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tool-card/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-medium backdrop-blur-sm">
            <FileText className="w-4 h-4" />
            Unlimited Use
          </span>
        </div>
      </div>
    </div>
  );
}
