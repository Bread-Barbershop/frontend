import React, { useMemo, useState } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import {
  GalleryItemVariants,
  GalleryLayoutVariants,
} from '../GalleryCarouselType';
import { GalleryVariant, RatioType } from '../types/galleryType';

interface Props {
  preview: string[];
  variant: GalleryVariant;
  ratio: RatioType;
  imageClick: (index: number) => void;
}

function ImageGrid({ preview, variant, ratio, imageClick }: Props) {
  const [visibleCount, setVisibleCount] = useState(
    variant === 'galleryType6' ? 12 : 6
  );

  const visiblePreview = useMemo(
    () => preview.slice(0, visibleCount),
    [preview, visibleCount]
  );
  return (
    <div className={cn('relative', GalleryLayoutVariants({ variant }))}>
      {visiblePreview.map((file, index) => (
        <div
          key={index}
          className={cn(
            'overflow-hidden rounded-lg cursor-pointer',
            GalleryItemVariants({ ratio, variant }) // variant 명시하여 Grid 내부에서 flex 영향 제거
          )}
          onClick={() => imageClick(index)}
        >
          <Image
            src={file}
            alt={`갤러리 이미지 ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
      {visibleCount < preview.length && (
        <div className="flex justify-center items-end pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%">
          <button
            type="button"
            className="flex-center pointer-events-auto cursor-pointer rounded-full border border-[#EAEAEA] backdrop-blur-[6px] bg-white/10 w-8 h-8"
            onClick={e => {
              e.stopPropagation();
              setVisibleCount(
                prev => prev + (variant === 'galleryType6' ? 12 : 6)
              );
            }}
          >
            <svg
              width="12"
              height="15"
              viewBox="0 0 12 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 1L6 13M1 9L6 14L11 9"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageGrid;
