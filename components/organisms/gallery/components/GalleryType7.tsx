import React, { useState } from 'react';

import { Image } from '@/components/atoms/image';
import Arrow from '@/shared/assets/icons/arrow.svg';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType7({ imageClick, preview, ratio }: GalleryTemplateProps) {
  const [expandCount, setExpandCount] = useState(2);
  const [firstClick, setFirstClick] = useState(true);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);

  const shouldShowButton = preview.length > 2;
  const handleClickExpandButton = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (isFullyExpanded) {
      setExpandCount(2);
      setIsFullyExpanded(false);
      setFirstClick(true);
    } else {
      if (firstClick) {
        setFirstClick(false);
        setExpandCount(prev => prev + 2);
      } else {
        setIsFullyExpanded(true);
        setExpandCount(preview.length + 1);
      }
    }
  };
  return (
    <div className="relative w-full px-4">
      <div
        className={cn(
          'relative w-full grid grid-cols-2 gap-[15px] overflow-y-auto max-h-[300px] scrollbar-hide duration-500 ease-in-out scrollbar-hide'
        )}
      >
        {preview.slice(0, expandCount).map((file, index) => (
          <div
            role="button"
            tabIndex={0}
            key={index}
            aria-label="갤러리 더 보기"
            className={cn(
              'relative w-full rounded-lg cursor-pointer',
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
          onClick={handleClickExpandButton}
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

export default GalleryType7;
