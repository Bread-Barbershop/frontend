import Image from 'next/image';
import { ChangeEvent, ReactNode, RefObject, useEffect, useState } from 'react';

import { ImageUploadButton } from '@/components/atoms/button/ImageUploadButton';
import { cn } from '@/shared/utils/cn';

interface ImagePreviewProps {
  src: string;
  alt: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onUploadClick: () => void;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  emptyStateContent?: ReactNode;
  allowPreviewClick?: boolean;
  imageSize?: number;
  imageClassName?: string;
  previewWrapperClassName?: string;
}

export const ImagePreview = ({
  src,
  alt,
  inputRef,
  onUploadClick,
  onInputChange,
  emptyStateContent,
  allowPreviewClick = false,
  imageSize = 335,
  imageClassName,
  previewWrapperClassName,
}: ImagePreviewProps) => {
  const [previewDimensions, setPreviewDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loadedSrc, setLoadedSrc] = useState('');

  useEffect(() => {
    if (!src) return;

    let isMounted = true;
    const previewImage = new window.Image();

    previewImage.onload = () => {
      if (!isMounted) return;

      const naturalWidth = previewImage.naturalWidth || imageSize;
      const naturalHeight = previewImage.naturalHeight || imageSize;
      const scale = imageSize / Math.max(naturalWidth, naturalHeight, 1);

      setPreviewDimensions({
        width: Math.round(naturalWidth * scale),
        height: Math.round(naturalHeight * scale),
      });
      setLoadedSrc(src);
    };

    previewImage.src = src;

    return () => {
      isMounted = false;
    };
  }, [src, imageSize]);

  const resolvedPreviewDimensions =
    loadedSrc === src && previewDimensions
      ? previewDimensions
      : {
          width: imageSize,
          height: imageSize,
        };

  if (!src) {
    return (
      <ImageUploadButton
        ref={inputRef}
        onButtonClick={onUploadClick}
        onInputChange={onInputChange}
        size={imageSize}
      >
        {emptyStateContent}
      </ImageUploadButton>
    );
  }

  return (
    <>
      <div
        className={cn(
          'relative inline-block overflow-hidden rounded-lg border border-border-neutral align-top',
          allowPreviewClick && 'group cursor-pointer',
          previewWrapperClassName
        )}
        style={resolvedPreviewDimensions}
        onClick={allowPreviewClick ? onUploadClick : undefined}
      >
        <Image
          src={src}
          alt={alt}
          className={cn('object-contain bg-bg-sub', imageClassName)}
          width={resolvedPreviewDimensions.width}
          height={resolvedPreviewDimensions.height}
          unoptimized
        />
        {allowPreviewClick ? (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              onUploadClick();
            }}
            className="absolute inset-0 hidden items-center justify-center bg-black/50 text-sm font-semibold text-white group-hover:flex"
          >
            <p className="w-[143px] h-[42px] rounded-lg text-text-primary flex items-center justify-center text-[15px] font-semibold bg-bg-base">
              이미지 변경하기
            </p>
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </>
  );
};
