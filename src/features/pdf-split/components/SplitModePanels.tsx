'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VisualPageSelector } from '@/components/common/VisualPageSelector';
import type { EvenOddChoice } from '../types';

interface RangePanelProps {
  pageRange: string;
  onPageRangeChange: (range: string) => void;
  downloadAsZip: boolean;
  onDownloadAsZipChange: (zip: boolean) => void;
  totalPages: number;
  disabled?: boolean;
}

export const RangePanel = ({
  pageRange,
  onPageRangeChange,
  downloadAsZip,
  onDownloadAsZipChange,
  totalPages,
  disabled = false,
}: RangePanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="page-range">
          Enter page range (e.g., 1-3, 5, 8-10):
        </Label>
        <Input
          type="text"
          id="page-range"
          value={pageRange}
          onChange={(e) => onPageRangeChange(e.target.value)}
          placeholder="e.g., 1-3, 5, 8-10"
          className="mt-2"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Total Pages: {totalPages}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="download-as-zip-range"
          checked={downloadAsZip}
          onCheckedChange={(checked) => onDownloadAsZipChange(checked === true)}
          disabled={disabled}
        />
        <Label
          htmlFor="download-as-zip-range"
          className="text-sm font-normal cursor-pointer"
        >
          Download as ZIP (one PDF per page)
        </Label>
      </div>
    </div>
  );
};

interface VisualPanelProps {
  pdfFile: File;
  selectedPages: Set<number>;
  onSelectionChange: (pages: Set<number>) => void;
  downloadAsZip: boolean;
  onDownloadAsZipChange: (zip: boolean) => void;
  disabled?: boolean;
}

export const VisualPanel = ({
  pdfFile,
  selectedPages,
  onSelectionChange,
  downloadAsZip,
  onDownloadAsZipChange,
  disabled = false,
}: VisualPanelProps) => {
  return (
    <div className="space-y-4">
      <VisualPageSelector
        pdfFile={pdfFile}
        selectedPages={selectedPages}
        onSelectionChange={onSelectionChange}
        disabled={disabled}
      />
      <div className="flex items-center space-x-2">
        <Checkbox
          id="download-as-zip-visual"
          checked={downloadAsZip}
          onCheckedChange={(checked) => onDownloadAsZipChange(checked === true)}
          disabled={disabled}
        />
        <Label
          htmlFor="download-as-zip-visual"
          className="text-sm font-normal cursor-pointer"
        >
          Download as ZIP (one PDF per page)
        </Label>
      </div>
    </div>
  );
};

interface EvenOddPanelProps {
  choice: EvenOddChoice;
  onChoiceChange: (choice: EvenOddChoice) => void;
  disabled?: boolean;
}

export const EvenOddPanel = ({
  choice,
  onChoiceChange,
  disabled = false,
}: EvenOddPanelProps) => {
  return (
    <div className="space-y-4">
      <Label>Select pages to extract:</Label>
      <RadioGroup
        value={choice}
        onValueChange={(value) => onChoiceChange(value as EvenOddChoice)}
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="even" id="even" />
          <Label htmlFor="even" className="font-normal cursor-pointer">
            Even pages only
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="odd" id="odd" />
          <Label htmlFor="odd" className="font-normal cursor-pointer">
            Odd pages only
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

interface AllPanelProps {
  totalPages: number;
}

export const AllPanel = ({ totalPages }: AllPanelProps) => {
  return (
    <div className="p-4 bg-muted rounded-md">
      <p className="text-sm text-muted-foreground">
        All {totalPages} pages will be extracted into individual PDF files and
        downloaded as a ZIP archive.
      </p>
    </div>
  );
};

interface BookmarksPanelProps {
  bookmarkLevel: string;
  onBookmarkLevelChange: (level: string) => void;
  disabled?: boolean;
}

export const BookmarksPanel = ({
  bookmarkLevel,
  onBookmarkLevelChange,
  disabled = false,
}: BookmarksPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bookmark-level">Bookmark Level:</Label>
        <Select
          value={bookmarkLevel}
          onValueChange={onBookmarkLevelChange}
          disabled={disabled}
        >
          <SelectTrigger id="bookmark-level" className="w-full mt-2">
            <SelectValue placeholder="Select bookmark level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="0">Level 0 (Top Level)</SelectItem>
            <SelectItem value="1">Level 1</SelectItem>
            <SelectItem value="2">Level 2</SelectItem>
            <SelectItem value="3">Level 3</SelectItem>
            <SelectItem value="4">Level 4</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          The PDF will be split at each bookmark of the selected level.
        </p>
      </div>
    </div>
  );
};

interface NTimesPanelProps {
  nValue: number;
  onNValueChange: (n: number) => void;
  totalPages: number;
  disabled?: boolean;
}

export const NTimesPanel = ({
  nValue,
  onNValueChange,
  totalPages,
  disabled = false,
}: NTimesPanelProps) => {
  const remainder = totalPages % nValue;
  const showWarning = remainder !== 0;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="n-value">Split into chunks of N pages:</Label>
        <Input
          type="number"
          id="n-value"
          value={nValue}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value > 0) {
              onNValueChange(value);
            }
          }}
          min="1"
          className="mt-2"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Total Pages: {totalPages}
        </p>
      </div>
      {showWarning && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
          <p className="text-sm text-warning-foreground">
            The PDF has {totalPages} pages, which is not evenly divisible by{' '}
            {nValue}. The last PDF will contain {remainder} page(s).
          </p>
        </div>
      )}
    </div>
  );
};

