'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface SignatureUploadTabProps {
  onSave: (imageDataUrl: string) => void;
  disabled?: boolean;
}

export const SignatureUploadTab = ({ onSave, disabled }: SignatureUploadTabProps) => {
  const [, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'image/png') {
      alert('Please select a PNG file only.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setPreview(result);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = () => {
    if (preview) {
      onSave(preview);
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="signature-upload-input">Upload PNG Image</Label>
        <Input
          type="file"
          id="signature-upload-input"
          accept="image/png"
          onChange={handleFileChange}
          disabled={disabled}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">*PNG files only</p>
      </div>

      {preview && (
        <div className="space-y-2">
          <div className="border border-border rounded-md p-2 bg-input relative h-32 flex items-center justify-center">
            <Image
              src={preview}
              alt="Signature preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <Button onClick={handleSave} disabled={disabled} className="w-full">
            Save Signature
          </Button>
        </div>
      )}
    </div>
  );
};

