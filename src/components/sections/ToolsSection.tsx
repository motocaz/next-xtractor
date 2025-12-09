import { MarkerSlanted } from "@/components/ui/marker-slanted";

export function ToolsSection() {
  return (
    <div id="tools-header" className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Get Started with <MarkerSlanted className="ml-2"> Tools</MarkerSlanted>
      </h2>
      <p className="text-muted-foreground">Click a tool to open the file uploader</p>
      
      <div className="mt-8">
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <p className="text-muted-foreground">
            Tools section will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}

