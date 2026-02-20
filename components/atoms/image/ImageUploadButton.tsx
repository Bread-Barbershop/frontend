'use client';

import { Plus } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, useId } from 'react';

import { cn } from '@/shared/utils/cn';

interface ImageUploadButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  className?: string;
}

export const ImageUploadButton = forwardRef<
  HTMLInputElement,
  ImageUploadButtonProps
>(({ id, className, accept = 'image/*', disabled = false, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <>
      {/* 실제 파일 input (숨김) */}
      <input
        ref={ref}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        {...props}
      />

      {/* 업로드 버튼 */}
      <label
        htmlFor={inputId}
        aria-label="이미지 업로드"
        className={cn(
          'w-15 h-15',
          'flex items-center justify-center',
          'border border-dashed',
          'cursor-pointer',
          'transition-colors',
          'hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <Plus size={24} strokeWidth={2} />
      </label>
    </>
  );
});

ImageUploadButton.displayName = 'ImageUploadButton';
