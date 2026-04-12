import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import AutoScroll, { AutoScrollOptionsType } from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect, useMemo } from 'react';

import { cn } from '@/shared/utils/cn';

import NextButton from '../CarouselButton/NextButton';
import PrevButton from '../CarouselButton/PrevButton';

interface Props {
  options?: EmblaOptionsType;
  children?: React.ReactNode;
  className?: string;
  carouselClassName?: string;
  isButtonShow?: boolean;
  buttonClassName?: string;
  onScroll?: (emblaApi: EmblaCarouselType) => void;
  loop?: boolean;
  autoscroll?: boolean;
  autoscrollOptions?: AutoScrollOptionsType;
}

function Carousel({
  options,
  children,
  className,
  carouselClassName,
  isButtonShow,
  buttonClassName,
  onScroll,
  loop = false,
  autoscroll = false,
  autoscrollOptions,
}: Props) {
  const plugins = useMemo(() => {
    const list = [];
    if (autoscroll) {
      list.push(AutoScroll(autoscrollOptions));
    }
    return list;
  }, [autoscroll, autoscrollOptions]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ ...options, loop }, plugins);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, children, options]);

  useEffect(() => {
    if (!emblaApi || !onScroll) return;

    const scrollHandler = () => onScroll(emblaApi);

    emblaApi.on('scroll', scrollHandler);
    emblaApi.on('reInit', scrollHandler);

    onScroll(emblaApi);

    return () => {
      emblaApi.off('scroll', scrollHandler);
      emblaApi.off('reInit', scrollHandler);
    };
  }, [emblaApi, onScroll]);

  const goToPrev = () => emblaApi?.scrollPrev();
  const goToNext = () => emblaApi?.scrollNext();
  return (
    <div className={cn('w-full h-full', className)}>
      <div className="overflow-hidden h-full relative" ref={emblaRef}>
        <div
          className={cn(
            `flex touch-pan-y touch-pinch-zoom w-full h-full`,
            carouselClassName
          )}
        >
          {children}
        </div>
      </div>
      {isButtonShow && (
        <div className={cn('flex', buttonClassName)}>
          <PrevButton onClick={goToPrev} />
          <NextButton onClick={goToNext} />
        </div>
      )}
    </div>
  );
}

export default Carousel;
