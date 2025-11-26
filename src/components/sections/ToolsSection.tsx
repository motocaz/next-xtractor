import { MarkerSlanted } from "@/components/ui/marker-slanted";

export function ToolsSection() {
  return (
    <div id="tools-header" className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Get Started with <MarkerSlanted className="ml-2"> Tools</MarkerSlanted>
      </h2>
      <p className="text-gray-400">Click a tool to open the file uploader</p>
      
      <div className="mt-8">
        <div className="bg-tool-card rounded-xl p-8 border border-gray-700 text-center">
          <p className="text-gray-400">
            Tools section will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}

