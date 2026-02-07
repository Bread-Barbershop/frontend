'use client';

import React, { useEffect, useMemo } from 'react';

import { Label } from '@/components/atoms/label';
import { PictureInput } from '@/components/atoms/picture/PictureInput';
import { PicturePreview } from '@/components/atoms/picture/PicturePreview';
import { cn } from '@/shared/utils/cn';

interface PictureProps {
  value?: File[];
  label: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  className?: string;
}

export const Picture = ({
  value,
  label = '사진',
  multiple,
  onChange,
  className,
}: PictureProps) => {
  const preview = useMemo(() => {
    return (value ?? []).map(file => URL.createObjectURL(file));
  }, [value]);

  useEffect(() => {
    return () => {
      preview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files) return;
    console.log('files', files);
    if (onChange) {
      onChange(files);
    }
  };
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label className="font-semibold shrink-0">{label}</Label>
      <div className="flex gap-2">
        {preview.length > 0 &&
          preview.map(pictureScr => {
            const id = crypto.randomUUID();
            return (
              <PicturePreview src={pictureScr} key={id} className={className} />
            );
          })}
        {(multiple || preview.length === 0) && (
          <PictureInput
            onChange={e => handleChange(e)}
            multiple={multiple}
            className={className}
          />
        )}
      </div>
    </div>
  );
};
Picture.displayName = 'Picture';
