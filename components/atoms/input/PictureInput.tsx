'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { cn } from '@/shared/utils/cn';

import { pictureVariants } from '../picture/PictureInput.style';

interface PictureInputProps {
  className?: string;
}

export const PictureInput = ({ className, ...props }: PictureInputProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('이벤트', file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div>
      <input
        type="file"
        id="file"
        className="hidden"
        {...props}
        onChange={handleChange}
      />

      <label
        htmlFor="file"
        className={cn(
          pictureVariants({ className }),
          'relative overflow-hidden'
        )}
      >
        {!preview && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>사진 추가 버튼</title>
            <path
              d="M0.800049 7.80078H14.8M7.80005 0.800781V14.8008"
              stroke="black"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
        {preview && (
          <Image
            src={preview}
            alt="이미지 미리보기"
            fill
            className="object-cover"
          />
        )}
      </label>
    </div>
  );
};
PictureInput.displayName = 'PictureInput';
