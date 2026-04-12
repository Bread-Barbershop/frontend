import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';

import { cn } from '@/shared/utils/cn';

interface Props {
  children?: React.ReactNode;
  className?: string;
  carouselClassName?: string;
}

function AutoScrollCarousel({ children, className, carouselClassName }: Props) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    AutoScroll({
      playOnInit: true,
      speed: 0.8, // 스크롤 속도 (기본 1)
      startDelay: 0, // 시작 지연 (ms)
      direction: 'forward', // 'forward' | 'backward'
      stopOnInteraction: false, // 사용자 조작 후 멈춤 여부
      stopOnMouseEnter: true, // 호버 시 일시정지
    }),
  ]);

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
    </div>
  );
}

export default AutoScrollCarousel;
