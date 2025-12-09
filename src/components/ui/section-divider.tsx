import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function SectionDivider({ className, ...props }: SectionDividerProps) {
  return (
    <div
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 my-8 max-w-xl mx-auto",
        className
      )}
      {...props}
    />
  );
}

export { SectionDivider };

