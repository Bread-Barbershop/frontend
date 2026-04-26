import React, { useState } from 'react';

import { Image } from '@/components/atoms/image';
import Arrow from '@/shared/assets/icons/arrow.svg';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

const GRID_HEIGHT_UNIT = 200; // 1개 행 높이 (px)

function GalleryType6({ imageClick, preview, ratio }: GalleryTemplateProps) {
  const [expandCount, setExpandCount] = useState(1);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);

  const maxHeight = expandCount * GRID_HEIGHT_UNIT;
  const shouldShowButton = preview.length > 3;

  return (
    <div className="relative w-full px-4">
      <div
        className={cn(
          'relative w-full grid grid-cols-3 gap-4.5 overflow-hidden transition-[max-height] duration-500 ease-in-out'
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
            role="button"
            tabIndex={0}
            key={index}
            className={cn(
              'relative w-full overflow-hidden rounded-lg cursor-pointer',
              GalleryItemVariants({ ratio })
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

      <div
        className={cn(
          'flex justify-center items-end pointer-events-none absolute bottom-0 left-0 right-0 h-13',
          !isFullyExpanded &&
            'bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%',
          'transition-opacity duration-300 ease-in-out',
          !shouldShowButton && 'opacity-0'
        )}
        aria-hidden={!shouldShowButton}
      >
        <button
          type="button"
          aria-label={isFullyExpanded ? '갤러리 접기' : '갤러리 더 보기'}
          className={cn(
            'flex-center rounded-full border border-[#EAEAEA] backdrop-blur-[6px] bg-white/10 w-8 h-8',
            shouldShowButton
              ? 'pointer-events-auto cursor-pointer'
              : 'pointer-events-none'
          )}
          onClick={e => {
            e.stopPropagation();
            if (isFullyExpanded) {
              setExpandCount(1);
              setIsFullyExpanded(false);
            } else {
              setExpandCount(prev => prev + 3);
            }
          }}
        >
          <Arrow
            className={cn(
              'w-3 h-[15px] text-black transition-transform duration-300',
              isFullyExpanded && 'rotate-180'
            )}
          />
        </button>
      </div>
    </div>
  );
}

export default GalleryType6;
