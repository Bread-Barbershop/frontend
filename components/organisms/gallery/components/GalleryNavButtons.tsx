import { EmblaCarouselType } from 'embla-carousel';
import React, { useCallback, useSyncExternalStore } from 'react';

import SlideArrow from '@/shared/assets/icons/slideArrow.svg';
import { cn } from '@/shared/utils/cn';

interface Props {
  emblaApi: EmblaCarouselType | undefined;
  className?: string;
  buttonClassName?: string;
  show?: boolean;
}

export function GalleryNavButtons({
  emblaApi,
  className,
  buttonClassName,
  show = true,
}: Props) {
  // Embla 인스턴스가 뒤늦게 준비되어도 첫 렌더부터 버튼 활성 상태를 반영한다.
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on('select', notify);
      emblaApi.on('reInit', notify);
      return () => {
        emblaApi.off('select', notify);
        emblaApi.off('reInit', notify);
      };
    },
    [emblaApi]
  );
  const getCanPrev = useCallback(
    () => emblaApi?.canScrollPrev() ?? false,
    [emblaApi]
  );
  const getCanNext = useCallback(
    () => emblaApi?.canScrollNext() ?? false,
    [emblaApi]
  );
  const canPrev = useSyncExternalStore(subscribe, getCanPrev, () => false);
  const canNext = useSyncExternalStore(subscribe, getCanNext, () => false);

  if (!show || !emblaApi) return null;

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-30', className)}
      aria-hidden="false"
    >
      <button
        type="button"
        aria-label="이전 사진"
        disabled={!canPrev}
        onClick={e => {
          e.stopPropagation();
          emblaApi.scrollPrev();
        }}
        className={cn(
          'pointer-events-auto absolute left-2.5 top-1/2 -translate-y-1/2',
          'w-8 h-8 rounded-full flex items-center justify-center',
          'bg-white/70 hover:bg-white text-gray-700/80 hover:text-black',
          'shadow-sm backdrop-blur-[2px] border border-black/10',
          'transition-all duration-150 active:scale-95 cursor-pointer select-none',
          'disabled:opacity-25 disabled:pointer-events-none',
          buttonClassName
        )}
      >
        <SlideArrow className="w-2.5 h-3.5" />
      </button>

      <button
        type="button"
        aria-label="다음 사진"
        disabled={!canNext}
        onClick={e => {
          e.stopPropagation();
          emblaApi.scrollNext();
        }}
        className={cn(
          'pointer-events-auto absolute right-2.5 top-1/2 -translate-y-1/2',
          'w-8 h-8 rounded-full flex items-center justify-center',
          'bg-white/70 hover:bg-white text-gray-700/80 hover:text-black',
          'shadow-sm backdrop-blur-[2px] border border-black/10',
          'transition-all duration-150 active:scale-95 cursor-pointer select-none',
          'disabled:opacity-25 disabled:pointer-events-none',
          buttonClassName
        )}
      >
        <SlideArrow className="w-2.5 h-3.5 rotate-180" />
      </button>
    </div>
  );
}

export default GalleryNavButtons;
