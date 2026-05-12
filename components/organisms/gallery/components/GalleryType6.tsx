import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Image } from '@/components/atoms/image';
import Arrow from '@/shared/assets/icons/arrow.svg';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType6({ imageClick, preview, ratio }: GalleryTemplateProps) {
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const [isBottom, setIsBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollBottom = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // 내용이 적어서 스크롤이 생기지 않는 경우도 바닥으로 간주
      const bottom = scrollHeight - scrollTop <= clientHeight + 1;
      setIsBottom(bottom);
    }
  }, []);

  const handleScroll = () => {
    checkScrollBottom();
  };

  useEffect(() => {
    // 렌더링 후 및 이미지 개수 변화 시 체크
    checkScrollBottom();
  }, [isFullyExpanded, preview, checkScrollBottom, ratio]);

  const ratioValue =
    {
      '1:1': 1,
      '4:3': 3 / 4,
      '3:4': 4 / 3,
      '16:9': 9 / 16,
      '9:16': 16 / 9,
    }[ratio] || 1;

  // 3열 그리드에서 이미지 한 장의 너비 대비 높이 계산 (간격 gap-4.5 = 18px 고려)
  // 100% 대신 100cqw를 사용하여 부모 너비를 정확히 참조
  const collapsedHeight = `calc(min(300px, ((100cqw - 36px) / 3) * ${ratioValue} + 2px))`;

  return (
    <div
      className="relative w-full px-4"
      style={{ containerType: 'inline-size' }}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maxHeight: isFullyExpanded ? '300px' : collapsedHeight,
        }}
        className={cn(
          'relative w-full grid grid-cols-3 gap-4.5 overflow-y-auto duration-500 ease-in-out scrollbar-hide transition-[max-height]'
        )}
      >
        {preview.map((file, index) => (
          <div
            role="button"
            tabIndex={0}
            key={index}
            className={cn(
              'relative w-full rounded-lg cursor-pointer',
              GalleryItemVariants({ ratio })
            )}
            onClick={() => {
              imageClick(index);
            }}
          >
            <Image
              src={file}
              alt={`갤러리 이미지 ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      <div
        className={cn(
          'flex justify-center items-end absolute bottom-0 left-0 right-0 h-13 pointer-events-none transition-opacity duration-300 ease-in-out',
          (!isFullyExpanded || !isBottom) &&
            'bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%'
        )}
        aria-hidden={isBottom}
      />
      <button
        type="button"
        aria-label={isFullyExpanded ? '갤러리 접기' : '갤러리 더 보기'}
        className={cn(
          ' absolute bottom-0 left-1/2 -translate-x-1/2 flex-center rounded-full border border-[#EAEAEA] backdrop-blur-[6px] bg-white/10 w-8 h-8 pointer-events-auto'
        )}
        onClick={e => {
          e.stopPropagation();
          setIsFullyExpanded(!isFullyExpanded);
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
  );
}

export default GalleryType6;
