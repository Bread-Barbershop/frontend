import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useRef } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType1({ ratio, preview, imageClick }: GalleryTemplateProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: false,
  });

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateSlides = useCallback(() => {
    if (!emblaApi) return;
    
  const scrollProgress = emblaApi.scrollProgress();
  const slidesCount = emblaApi.slideNodes().length;
  const maxIndex = slidesCount - 1;

  // 0~1 범위로 클램프
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  const selectedIndex = Math.round(clampedProgress * maxIndex);
    slideRefs.current.forEach((el, i) => {
      if (!el) return;      
      el.style.transform = i === selectedIndex ? 'scale(1)' : 'scale(0.6)';
      el.style.transition = 'transform 0.3s ease';
      
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateSlides();
    emblaApi.on('select', updateSlides).on('scroll', updateSlides).on('reInit', updateSlides);
    return () => {
      emblaApi.off('select', updateSlides).off('scroll', updateSlides).off('reInit', updateSlides);
    };
  }, [emblaApi,updateSlides]);



  return (
    <div className="w-full min-h-[120px]">
      <div ref={emblaRef} className="overflow-hidden py-10">
        <div className="flex items-center">
          {preview.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_50%]"
              ref={el => {
                slideRefs.current[i] = el;
              }}
              style={{ transition: 'none' }}
            >
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  'relative overflow-hidden rounded-lg min-h-[120px] shadow-gallery-image',
                  GalleryItemVariants({
                    ratio: ratio,
                  })
                )}
                onClick={() => imageClick(i)}
              >
                <Image
                  src={src}
                  alt={`slide-${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalleryType1;
