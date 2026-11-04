import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';
import { createInfiniteSlides } from '../utils/createInfiniteSlides';

function GalleryType1({
  ratio,
  preview,
  imageClick,
  isAutoPlay = false,
}: GalleryTemplateProps) {
  const isLoopActive = preview.length > 1;

  const slides = useMemo(
    () => createInfiniteSlides(preview, isLoopActive, isAutoPlay ? 8 : 5),
    [preview, isLoopActive, isAutoPlay]
  );

  const prefersReducedMotion = usePrefersReducedMotion();

  const plugins = useMemo(() => {
    if (!isAutoPlay || !isLoopActive || prefersReducedMotion) return [];
    return [
      AutoScroll({
        playOnInit: true,
        speed: 0.8,
        startDelay: 0,
        direction: 'forward',
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ];
  }, [isAutoPlay, isLoopActive, prefersReducedMotion]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: isLoopActive,
      align: 'center',
      containScroll: isLoopActive ? false : 'trimSnaps',
      watchDrag: true,
    },
    plugins
  );

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateSlides = useCallback(() => {
    if (!emblaApi) return;
    const selectedIndex = emblaApi.selectedScrollSnap();
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      if (prefersReducedMotion) {
        el.style.transform = 'none';
        el.style.opacity = '1';
        el.style.transition = 'none';
        return;
      }
      const isSelected = i === selectedIndex;
      // 포커스 진입 시에는 '뿅' 하고 경쾌하게 확대, 포커스 빠질 때는 여유롭고 부드럽게 축소
      el.style.transform = isSelected ? 'scale(1)' : 'scale(0.68)';
      el.style.opacity = isSelected ? '1' : '0.75';
      el.style.transition = isSelected
        ? 'transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.35s ease-out'
        : 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.65s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  }, [emblaApi, prefersReducedMotion]);

  useEffect(() => {
    if (!emblaApi) return;
    updateSlides();
    emblaApi
      .on('select', updateSlides)
      .on('scroll', updateSlides)
      .on('reInit', updateSlides);
    return () => {
      emblaApi
        .off('select', updateSlides)
        .off('scroll', updateSlides)
        .off('reInit', updateSlides);
    };
  }, [emblaApi, updateSlides]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, isAutoPlay, slides.length]);

  const { handlePointerDown, handlePointerMove, handleCardClick } =
    useGallerySwipeClick(imageClick, emblaApi);

  return (
    <div className="relative w-full min-h-[120px] group/gallery">
      <div
        ref={emblaRef}
        className="overflow-hidden py-10 touch-pan-y touch-pinch-zoom select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center">
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_50%] shrink-0"
              ref={el => {
                slideRefs.current[i] = el;
              }}
              style={{ transition: 'none' }}
            >
              <div
                role="button"
                tabIndex={i < preview.length ? 0 : -1}
                aria-hidden={i >= preview.length ? true : undefined}
                className={cn(
                  'relative overflow-hidden rounded-lg min-h-[120px] shadow-gallery-image select-none',
                  GalleryItemVariants({
                    ratio: ratio,
                  })
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(i % preview.length);
                  }
                }}
                onClick={() => handleCardClick(i % preview.length)}
              >
                <Image
                  src={src}
                  alt={`slide-${i % preview.length}`}
                  fill
                  className="object-cover pointer-events-none select-none"
                  draggable={false}
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
