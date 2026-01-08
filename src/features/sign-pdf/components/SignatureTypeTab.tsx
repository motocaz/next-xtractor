'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SignatureTypeTabProps {
  onSave: (imageDataUrl: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const FONT_OPTIONS = [
  { value: "'Great Vibes', cursive", label: 'Signature' },
  { value: "'Kalam', cursive", label: 'Handwritten' },
  { value: "'Dancing Script', cursive", label: 'Script' },
  { value: "'Lato', sans-serif", label: 'Regular' },
  { value: "'Merriweather', serif", label: 'Formal' },
];

export const SignatureTypeTab = ({ onSave, onError, disabled }: SignatureTypeTabProps) => {
  const [text, setText] = useState('Your Name');
  const [fontFamily, setFontFamily] = useState("'Great Vibes', cursive");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState('#000000');
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    try {
      await document.fonts.ready;
      
      const fontToCheck = fontFamily.split(',')[0].trim().replace(/'/g, '');
      if (!document.fonts.check(`${fontSize}px "${fontToCheck}"`)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to create canvas context');
      }

      const scale = 2;
      canvas.width = 800 * scale;
      canvas.height = 200 * scale;
      context.scale(scale, scale);

      context.font = `${fontSize}px ${fontFamily}`;
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      context.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

      context.fillText(
        text,
        (canvas.width / scale) / 2,
        (canvas.height / scale) / 2
      );

      const dataUrl = canvas.toDataURL('image/png');
      
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Failed to generate image data');
      }

      onSave(dataUrl);
      
      setText('Your Name');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save signature';
      console.error('Error creating signature image:', err);
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your name here"
        disabled={disabled}
        className="w-full"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="font-family-select" className="block mb-1 text-xs font-medium">
            Font Style
          </Label>
          <Select value={fontFamily} onValueChange={setFontFamily} disabled={disabled}>
            <SelectTrigger id="font-family-select">
              <SelectValue placeholder="Select font">
                {FONT_OPTIONS.find((opt) => opt.value === fontFamily)?.label || 'Select font'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="font-size-slider" className="block mb-1 text-xs font-medium">
            Font Size ({fontSize}px)
          </Label>
          <Slider
            id="font-size-slider"
            min={24}
            max={72}
            value={[fontSize]}
            onValueChange={(values) => setFontSize(values[0] ?? 32)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="font-color-picker" className="block mb-1 text-xs font-medium">
            Color
          </Label>
          <input
            type="color"
            id="font-color-picker"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={disabled}
            className="w-full h-[38px] bg-input border border-border rounded-lg p-1 cursor-pointer"
          />
        </div>
      </div>

      <div
        ref={previewRef}
        className="p-4 h-[80px] bg-white rounded-md flex items-center justify-center text-4xl border border-border"
        style={{
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          color: color,
        }}
      >
        {text || 'Your Name'}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={disabled || isSaving || !text.trim()}>
          {isSaving ? 'Saving...' : 'Save Signature'}
        </Button>
      </div>
    </div>
  );
};

