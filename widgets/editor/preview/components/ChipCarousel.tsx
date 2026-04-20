import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

import SlideArrow from '@/shared/assets/icons/slideArrow.svg';
import { cn } from '@/shared/utils/cn';

interface Props {
  options?: EmblaOptionsType;
  setEmblaApi?: (api: EmblaCarouselType) => void;
  onReset?: () => void;
  className?: string;
  parentClassName?: string;
  children: React.ReactNode;
}

function ChipCarousel({
  options,
  setEmblaApi,
  className,
  parentClassName,
  children,
  onReset,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    WheelGesturesPlugin(),
  ]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const syncScrollState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    syncScrollState();

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // 생성된 Embla API 인스턴스를 외부(부모 컴포넌트)로 전달합니다.
  // 이를 통해 부모 세그먼트에서 캐러셀의 스크롤 이벤트를 구독하거나 제어할 수 있습니다.
  useEffect(() => {
    if (emblaApi && setEmblaApi) {
      setEmblaApi(emblaApi);
    }
  }, [emblaApi, setEmblaApi]);

  const isVertical = options?.axis === 'y';

  return (
    <div className={cn('min-w-0 flex-1', className)}>
      <div
        className={cn(
          'relative flex',
          isVertical ? 'flex-col items-center h-full' : 'items-center'
        )}
      >
        <AnimatePresence>
          {canScrollPrev && (
            <motion.div
              initial={
                isVertical
                  ? { height: 0, opacity: 0 }
                  : { width: 0, opacity: 0 }
              }
              animate={
                isVertical
                  ? { height: 32, opacity: 1 }
                  : { width: 32, opacity: 1 }
              }
              exit={
                isVertical
                  ? { height: 0, opacity: 0 }
                  : { width: 0, opacity: 0 }
              }
              transition={{ duration: 0.1, ease: 'easeInOut' }}
              className={cn(
                'cursor-pointer bg-bg-base overflow-hidden shrink-0',
                isVertical ? 'w-full' : 'h-full'
              )}
            >
              <button
                type="button"
                className="w-full h-full flex-center"
                onClick={e => {
                  e.stopPropagation();
                  if (onReset) onReset();
                  scrollPrev();
                }}
                aria-label="이전 버튼"
              >
                <SlideArrow
                  className={`w-[9px] h-[14px] ${isVertical ? 'rotate-90' : 'rotate-0'}`}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1  w-full">
          <div ref={emblaRef} className="overflow-hidden">
            <div className={cn('flex gap-1.5 max-h-94', parentClassName)}>
              {children}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {canScrollNext && (
            <motion.div
              initial={
                isVertical
                  ? { height: 0, opacity: 0 }
                  : { width: 0, opacity: 0 }
              }
              animate={
                isVertical
                  ? { height: 32, opacity: 1 }
                  : { width: 32, opacity: 1 }
              }
              exit={
                isVertical
                  ? { height: 0, opacity: 0 }
                  : { width: 0, opacity: 0 }
              }
              transition={{ duration: 0.1, ease: 'easeInOut' }}
              className={cn(
                'cursor-pointer bg-bg-base flex-center overflow-hidden shrink-0',
                isVertical ? 'w-full' : 'h-full'
              )}
            >
              <button
                type="button"
                className="w-full h-full flex-center"
                onClick={e => {
                  e.stopPropagation();
                  if (onReset) onReset();
                  scrollNext();
                }}
                aria-label="다음 버튼"
              >
                <SlideArrow
                  className={`w-[9px] h-[14px] ${isVertical ? 'rotate-270' : 'rotate-180'}`}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ChipCarousel;
