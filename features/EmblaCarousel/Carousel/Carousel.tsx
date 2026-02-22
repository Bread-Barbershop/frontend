import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect } from 'react';

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
}

function Carousel({
  options,
  children,
  className,
  carouselClassName,
  isButtonShow,
  buttonClassName,
  onScroll,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

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
