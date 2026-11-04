import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';

import GalleryNavButtons from './GalleryNavButtons';

// 중앙으로부터의 거리(0~3+)에 따라 transform 계산
function getSlideStyle(distance: number) {
  const abs = Math.abs(distance);
  const sign = Math.sign(distance);

  if (abs < 0.01) {
    return { opacity: 1, scale: 1, rotate: 0, y: 0, z: 20 };
  }

  // 거리에 따라 보간 (1, 2, 3 단계를 연속적으로)
  const configs = [
    { scale: 1, rotate: 0, z: 20 }, // 0: center
    { scale: 0.8, rotate: 5, z: 10 }, // 1
    { scale: 0.56, rotate: 10, z: 5 }, // 2
    { scale: 0.3, rotate: 15, z: 2 }, // 3
  ];

  // abs가 3.5 이상이면 숨김
  if (abs >= 3.5) {
    return { opacity: 0, scale: 0.3, rotate: 15 * sign, y: 20, z: 1 };
  }

  const lower = Math.floor(abs);
  const upper = Math.min(lower + 1, configs.length - 1);
  const t = abs - lower; // 0~1 사이 보간 비율

  const from = configs[lower];
  const to = configs[upper];

  const scale = from.scale + (to.scale - from.scale) * t;
  const rotate = (from.rotate + (to.rotate - from.rotate) * t) * sign;
  const z = Math.round(from.z + (to.z - from.z) * t);
  const opacity = abs > 3 ? 1 - (abs - 3) * 2 : 1;

  return { opacity: Math.max(0, opacity), scale, rotate, y: 0, z };
}

function GalleryType2({
  preview,
  ratio,
  imageClick,
  isAutoPlay = false,
}: GalleryTemplateProps) {
  const isLoopActive = Boolean(isAutoPlay && preview.length > 1);

  const slides = useMemo(() => {
    if (!isLoopActive) return preview;
    if (preview.length < 6) {
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

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyStyles = useCallback(() => {
    if (!emblaApi) return;

    const rawProgress = emblaApi.scrollProgress();
    const slidesCount = emblaApi.slideNodes().length;
    if (slidesCount === 0) return;

    const maxIndex = slidesCount - 1;
    let currentCenter: number;
    if (isLoopActive) {
      const normalizedProgress = ((rawProgress % 1) + 1) % 1;
      currentCenter = normalizedProgress * slidesCount;
    } else {
      currentCenter = rawProgress * maxIndex;
    }

    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      let distance = i - currentCenter;
      if (isLoopActive) {
        if (distance > slidesCount / 2) distance -= slidesCount;
        if (distance < -slidesCount / 2) distance += slidesCount;
      }
      const style = getSlideStyle(distance);

      el.style.opacity = `${style.opacity}`;
      el.style.transform = `scale(${style.scale}) rotate(${style.rotate}deg)`;
      el.style.zIndex = `${style.z}`;
      el.style.pointerEvents = style.opacity > 0.5 ? 'auto' : 'none';
    });
  }, [emblaApi, isLoopActive]);

  useEffect(() => {
    if (!emblaApi) return;

    applyStyles();
    emblaApi.on('scroll', applyStyles);
    emblaApi.on('reInit', applyStyles);

    return () => {
      emblaApi.off('scroll', applyStyles);
      emblaApi.off('reInit', applyStyles);
    };
  }, [emblaApi, applyStyles]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, isAutoPlay, slides.length]);

  const { handlePointerDown, handlePointerMove, handleCardClick } =
    useGallerySwipeClick(imageClick, emblaApi);

  return (
    <div className="relative w-full min-h-[120px] group/gallery">
      <div
        ref={emblaRef}
        className="py-10 overflow-hidden touch-pan-y touch-pinch-zoom select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center px-[20%]">
          {slides.map((src, i) => (
            <div
              key={i}
              ref={el => {
                slideRefs.current[i] = el;
              }}
              className="flex-[0_0_70%] -mx-10 shrink-0"
              style={{ transformOrigin: 'bottom center', transition: 'none' }}
            >
              <div
                role="button"
                tabIndex={i < preview.length ? 0 : -1}
                aria-hidden={i >= preview.length ? true : undefined}
                className={cn(
                  'relative overflow-hidden rounded-lg min-h-[120px] shadow-gallery-image select-none',
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
      {preview.length > 1 && <GalleryNavButtons emblaApi={emblaApi} />}
    </div>
  );
}

export default GalleryType2;
