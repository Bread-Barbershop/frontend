import { EmblaCarouselType } from 'embla-carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { Image } from '@/components/atoms/image';

import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';


const MAX_WIDTH = 200; // 중앙일 때 카드 폭
const MIN_WIDTH = 32; // 가장 멀어졌을 때 카드 폭

const RATIO_MAP: Record<string, number> = {
  '1:1': 1,
  '3:4': 4 / 3,
  '4:3': 3 / 4,
  '16:9': 9 / 16,
  '9:16': 16 / 9,
};

function GalleryType3({
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

  const rowHeight = MAX_WIDTH * (RATIO_MAP[ratio] ?? 1);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    const selectedIndex = emblaApi.selectedScrollSnap();
    emblaApi.slideNodes().forEach((slide, index) => {
      const card = slide.querySelector<HTMLElement>('[data-card]');
      if (!card) return;
      card.style.width =
        index === selectedIndex ? `${MAX_WIDTH}px` : `${MIN_WIDTH}px`;
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => onSelect(emblaApi);
    emblaApi
      .on('select', handler)
      .on('scroll', handler)
      .on('reInit', handler);
    handler();
    return () => {
      emblaApi
        .off('select', handler)
        .off('scroll', handler)
        .off('reInit', handler);
    };
  }, [emblaApi, onSelect]);

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
        <div
          className="flex items-stretch gap-2 transition-[height] duration-300"
          style={{ height: rowHeight }}
        >
          {slides.map((src, i) => (
            <div key={i} className="flex-[0_0_auto] flex shrink-0">
              <div
                data-card
                role="button"
                tabIndex={i < preview.length ? 0 : -1}
                aria-hidden={i >= preview.length ? true : undefined}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(i % preview.length);
                  }
                }}
                onClick={() => handleCardClick(i % preview.length)}
                className="h-full overflow-hidden rounded-lg bg-white shadow-md relative transition-[width] duration-300 select-none"
                style={{ width: `${MIN_WIDTH}px` }}
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
export default GalleryType3;
