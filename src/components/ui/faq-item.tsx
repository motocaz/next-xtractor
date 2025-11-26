"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const contentId = React.useId();
  const labelId = `${contentId}-label`;

  return (
    <div
      className={cn(
        "bg-[#18181b] rounded-lg border border-gray-700",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          "w-full flex justify-between items-center text-left p-6",
          "transition-colors",
          isOpen && "text-fuchsia-400"
        )}
      >
        <span id={labelId} className="text-lg font-semibold text-white">{question}</span>
        <ChevronDown
          className={cn(
            "w-6 h-6 text-gray-400 transition-transform shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
      id={contentId}
      aria-labelledby={labelId}
      role="region"
      aria-hidden={!isOpen}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="p-6 pt-0 text-gray-400">{answer}</div>
      </div>
    </div>
  );
}

export { FAQItem };

