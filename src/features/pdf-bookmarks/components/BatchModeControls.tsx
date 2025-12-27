'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckSquare, Square, Trash2 } from 'lucide-react';

interface BatchModeControlsProps {
  batchMode: boolean;
  selectedBookmarks: Set<string>;
  onToggleBatchMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApplyColor: (color: string | null) => void;
  onApplyStyle: (style: string | null) => void;
  onDeleteSelected: () => void;
}

export const BatchModeControls = ({
  batchMode,
  selectedBookmarks,
  onToggleBatchMode,
  onSelectAll,
  onDeselectAll,
  onApplyColor,
  onApplyStyle,
  onDeleteSelected,
}: BatchModeControlsProps) => {
  return (
    <div className="mb-4">
      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
        <input
          type="checkbox"
          checked={batchMode}
          onChange={onToggleBatchMode}
          className="w-4 h-4"
        />
        <span>Batch Mode ({selectedBookmarks.size} selected)</span>
      </Label>

      {batchMode && selectedBookmarks.size > 0 && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-xs font-semibold text-foreground mb-2">
            Batch Operations
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                className="flex-1 text-xs"
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeselectAll}
                className="flex-1 text-xs"
              >
                <Square className="h-3 w-3 mr-1" />
                Deselect All
              </Button>
            </div>

            <Select
              onValueChange={(value) => {
                if (value) {
                  onApplyColor(value === 'null' ? null : value);
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Set Color..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                if (value) {
                  onApplyStyle(value === 'null' ? null : value);
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Set Style..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="italic">Italic</SelectItem>
                <SelectItem value="bold-italic">Bold & Italic</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

