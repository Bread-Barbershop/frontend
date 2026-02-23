import React, { useEffect, useState } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import {
  GalleryItemVariants,
  GalleryLayoutVariants,
} from '../GalleryCarouselType';
import { GalleryVariant, RatioType } from '../types/galleryType';

const GRID_HEIGHT_UNIT = 400; // 한 번에 보여줄 높이 (px)

interface Props {
  preview: string[];
  variant: GalleryVariant;
  ratio: RatioType;
  imageClick: (index: number) => void;
}

function ImageGrid({ preview, variant, ratio, imageClick }: Props) {
  const [expandCount, setExpandCount] = useState(1);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);

  useEffect(() => {
    setExpandCount(1);
    setIsFullyExpanded(false);
  }, [variant, preview]);

  const maxHeight = expandCount * GRID_HEIGHT_UNIT;

  return (
    <div className="relative">
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-500 ease-in-out',
          GalleryLayoutVariants({ variant })
        )}
        style={{ maxHeight: isFullyExpanded ? 'none' : `${maxHeight}px` }}
        onTransitionEnd={e => {
          // 실제 콘텐츠가 maxHeight보다 작으면 완전 펼쳐진 것
          const el = e.currentTarget;

          if (el.scrollHeight <= maxHeight) {
            setIsFullyExpanded(true);
          }
        }}
      >
        {preview.map((file, index) => (
          <div
            key={index}
            className={cn(
              'overflow-hidden rounded-lg cursor-pointer',
              GalleryItemVariants({ ratio, variant })
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
      </div>

      {!isFullyExpanded && (
        <div className="flex justify-center items-end pointer-events-none absolute bottom-0 left-0 right-0 h-13 bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%">
          <button
            type="button"
            className="flex-center pointer-events-auto cursor-pointer rounded-full border border-[#EAEAEA] backdrop-blur-[6px] bg-white/10 w-8 h-8"
            onClick={e => {
              e.stopPropagation();
              setExpandCount(prev => prev + 1);
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
