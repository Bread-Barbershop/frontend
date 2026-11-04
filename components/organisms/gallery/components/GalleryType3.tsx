import { EmblaCarouselType } from 'embla-carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Image } from '@/components/atoms/image';

import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';
import { createInfiniteSlides } from '../utils/createInfiniteSlides';


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
  const isLoopActive = preview.length > 1;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [minSlides, setMinSlides] = useState(18);

  // 접힌 카드(32px)가 대부분이므로 넓은 화면에서는 고정 18장만으로 loop가 불가능하다.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const width = viewport.getBoundingClientRect().width;
      if (width <= 0) return;
      const needed = Math.max(
        18,
        Math.ceil((width * 2 + MAX_WIDTH) / (MIN_WIDTH + 8))
      );
      setMinSlides(current => (current === needed ? current : needed));
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(viewport);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const slides = useMemo(
    () => createInfiniteSlides(preview, isLoopActive, minSlides),
    [preview, isLoopActive, minSlides]
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
  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef]
  );

  const rowHeight = MAX_WIDTH * (RATIO_MAP[ratio] ?? 1);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    const selectedIndex = emblaApi.selectedScrollSnap();
    emblaApi.slideNodes().forEach((slide, index) => {
      const card = slide.querySelector<HTMLElement>('[data-card]');
      if (!card) return;
      if (prefersReducedMotion) {
        card.style.width = index === selectedIndex ? `${MAX_WIDTH}px` : `${MIN_WIDTH}px`;
        card.style.opacity = '1';
        card.style.transition = 'none';
        return;
      }
      const isSelected = index === selectedIndex;
      // 포커스 진입 시 오버슛(진동) 없이 부드러운 감속으로 펼쳐지고, 빠질 때는 점진적 축소
      card.style.width =
        isSelected ? `${MAX_WIDTH}px` : `${MIN_WIDTH}px`;
      card.style.opacity = isSelected ? '1' : '0.75';
      card.style.transition = isSelected
        ? 'width 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease-out'
        : 'width 0.55s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.55s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => onSelect(emblaApi);
    // scroll 이벤트마다 실행 시 트랜지션이 리셋되어 진동/지직거림이 발생하므로 select, reInit에서만 1회 실행
    emblaApi
      .on('select', handler)
      .on('reInit', handler);
    handler();
    return () => {
      emblaApi
        .off('select', handler)
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
        ref={setViewportRef}
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
                className="h-full overflow-hidden rounded-lg bg-white shadow-md relative select-none transform-gpu will-change-[width]"
                style={{ width: `${MIN_WIDTH}px` }}
              >
                <Image
                  src={src}
                  alt={`slide-${i % preview.length}`}
                  fill
                  className="object-cover pointer-events-none select-none transform-gpu"
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
