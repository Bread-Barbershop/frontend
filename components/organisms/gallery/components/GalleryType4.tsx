import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect, useMemo } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType4({
  imageClick,
  preview,
  ratio,
  isAutoPlay = false,
}: GalleryTemplateProps) {
  const isLoopActive = Boolean(isAutoPlay && preview.length > 1);

  const slides = useMemo(() => {
    if (!isLoopActive) return preview;
    if (preview.length < 5) {
      return [...preview, ...preview, ...preview];
    }
    return preview;
  }, [preview, isLoopActive]);

  const prefersReducedMotion = usePrefersReducedMotion();

  const plugins = useMemo(() => {
    if (!isLoopActive || prefersReducedMotion) return [];
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
  }, [isLoopActive, prefersReducedMotion]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: isLoopActive,
      align: 'center',
      containScroll: isLoopActive ? false : 'trimSnaps',
      watchDrag: true,
    },
    plugins
  );

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, isAutoPlay, slides.length]);

  const { handlePointerDown, handlePointerMove, handleCardClick } =
    useGallerySwipeClick(imageClick, emblaApi);

  return (
    <div className="relative w-full group/gallery">
      <div
        ref={emblaRef}
        className="overflow-hidden py-10 touch-pan-y touch-pinch-zoom select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-5">
          {slides.map((src, i) => (
            <div key={i} className="flex-[0_0_70%] shrink-0">
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

export default GalleryType4;
