'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { FormField, FormFieldValue } from '../types';

export interface FormFieldRendererProps {
  field: FormField;
  value: FormFieldValue;
  onChange: (value: FormFieldValue) => void;
}

export const FormFieldRenderer = ({
  field,
  value,
  onChange,
}: FormFieldRendererProps) => {
  const labelText = field.label;

  if (field.type === 'unsupported') {
    return (
      <div className="p-4 bg-input rounded-lg border border-accent">
        <p className="text-sm text-muted-foreground">
          {field.name.includes('Signature')
            ? 'Signature field: Not supported for direct editing.'
            : `Unsupported field type: ${field.name}`}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-input rounded-lg border border-accent space-y-2">
      <Label htmlFor={`field-${field.name}`} className="block text-sm font-medium capitalize">
        {labelText}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.type === 'text' && (
        <Input
          id={`field-${field.name}`}
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full dark:bg-accent dark:placeholder:text-accent-foreground/70 bg-background border-accent-foreground/15"
        />
      )}

      {field.type === 'checkbox' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`field-${field.name}`}
            checked={value === true || value === 'on'}
            onCheckedChange={(checked) => onChange(checked ? 'on' : 'off')}
          />
          <Label
            htmlFor={`field-${field.name}`}
            className="text-sm font-normal cursor-pointer"
          >
            {labelText}
          </Label>
        </div>
      )}

      {field.type === 'radio' && field.options && (
        <RadioGroup
          value={String(value)}
          onValueChange={(val) => onChange(val)}
        >
          {field.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.name}-${option}`} />
              <Label
                htmlFor={`${field.name}-${option}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {field.type === 'dropdown' && field.options && (
        <Select value={String(value)} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="w-full dark:bg-accent dark:placeholder:text-accent-foreground/70 bg-background border-accent-foreground/15">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'option-list' && field.options && (
        <div className="space-y-2">
          <select
            id={`field-${field.name}`}
            multiple
            size={Math.min(10, field.options.length)}
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
              onChange(selected);
            }}
            className="w-full dark:bg-accent dark:placeholder:text-accent-foreground/70 bg-background border-accent-foreground/15 text-foreground rounded-md p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Hold Ctrl (or Cmd on Mac) to select multiple options
          </p>
        </div>
      )}
    </div>
  );
};

