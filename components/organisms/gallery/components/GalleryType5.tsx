import { EmblaCarouselType } from 'embla-carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';
import { createInfiniteSlides } from '../utils/createInfiniteSlides';

function GalleryType5({
  imageClick,
  preview,
  ratio,
  isAutoPlay = false,
}: GalleryTemplateProps) {
  const isLoopActive = preview.length > 1;

  const slides = useMemo(
    () => createInfiniteSlides(preview, isLoopActive, 15),
    [preview, isLoopActive]
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

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    const slideNodes = emblaApi.slideNodes();
    slideNodes.forEach((slide, index) => {
      const target = slide.querySelector<HTMLElement>('[data-rotate-target]');
      if (!target) return;
      const rotate = 6 * (index % 2 === 0 ? 1 : -1);
      target.style.transform = `rotate(${rotate}deg)`;
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => onScroll(emblaApi);
    emblaApi.on('reInit', handler).on('select', handler);
    onScroll(emblaApi);
    return () => {
      emblaApi.off('reInit', handler).off('select', handler);
    };
  }, [emblaApi, onScroll]);

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
        <div className="flex items-center py-8">
          {slides.map((src, i) => (
            <div key={i} className="flex-[0_0_40%] min-w-0 -mx-1 shrink-0">
              <div
                data-rotate-target
                role="button"
                tabIndex={i < preview.length ? 0 : -1}
                aria-hidden={i >= preview.length ? true : undefined}
                style={{ margin: '0 -4px' }}
                className={cn(
                  'relative overflow-hidden p-2 pb-6 bg-bg-base rounded-sm min-h-[120px] shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_4px_0_rgba(0,0,0,0.08),0_8px_24px_0_rgba(0,0,0,0.1)] select-none',
                  GalleryItemVariants({ ratio })
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

export default GalleryType5;
