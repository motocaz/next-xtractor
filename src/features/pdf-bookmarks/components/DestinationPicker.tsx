'use client';

import { Button } from '@/components/ui/button';
import { Crosshair, X } from 'lucide-react';

interface DestinationPickerProps {
  isActive: boolean;
  onCancel: () => void;
}

export const DestinationPicker = ({
  isActive,
  onCancel,
}: DestinationPickerProps) => {
  if (!isActive) return null;

  return (
    <div className="mb-4 p-3 bg-primary/10 border-2 border-primary rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Click on the PDF to set bookmark destination
          </span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          className="text-xs"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
};


