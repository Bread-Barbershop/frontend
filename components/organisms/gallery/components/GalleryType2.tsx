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


// 중앙으로부터의 거리(0~3+)에 따라 transform 계산
function getSlideStyle(distance: number) {
  const abs = Math.abs(distance);
  const sign = Math.sign(distance);

  // abs가 3.2 이상이면 완전 숨김 (3에서 opacity: 0으로 부드럽게 수렴 후 숨김)
  if (abs >= 3.2) {
    return { opacity: 0, scale: 0.35, rotate: 12 * sign, y: 0, z: 1 };
  }

  // 거리에 따라 보간 (교차 타이밍 및 최종 수렴 시 자연스러운 fade-in / fade-out)
  const configs = [
    { scale: 1, rotate: 0, opacity: 1 }, // 0: center (가장 위, 완전 불투명 1.0)
    { scale: 0.82, rotate: 4.5, opacity: 0.65 }, // 1: 교차 시점 부드러운 fade
    { scale: 0.58, rotate: 8.5, opacity: 0.3 }, // 2: 배경 진입
    { scale: 0.35, rotate: 12, opacity: 0 }, // 3: 부드럽게 0으로 수렴
  ];

  const lower = Math.floor(abs);
  const upper = Math.min(lower + 1, configs.length - 1);
  const t = Math.min(1, Math.max(0, abs - lower)); // 0~1 사이 보간 비율

  // 부드러운 S-곡선(Smoothstep) 보간으로 끝단 및 경계에서의 급격한 변화(각진 꺾임) 제거
  const smoothT = t * t * (3 - 2 * t);

  const from = configs[lower];
  const to = configs[upper];

  const scale = from.scale + (to.scale - from.scale) * smoothT;
  const rotate = (from.rotate + (to.rotate - from.rotate) * smoothT) * sign;
  const opacity = from.opacity + (to.opacity - from.opacity) * smoothT;

  // 중심(abs = 0)에 가까울수록 엄격하게 더 높은 z-index를 부여하여 교차 시 z-index 역전 깜빡임 방지
  const z = Math.max(1, Math.round((10 - abs) * 100));


  return { opacity: Math.max(0, opacity), scale, rotate, y: 0, z };
}

function GalleryType2({
  preview,
  ratio,
  imageClick,
  isAutoPlay = false,
}: GalleryTemplateProps) {
  const isLoopActive = preview.length > 1;

  const slides = useMemo(
    () => createInfiniteSlides(preview, isLoopActive, 12),
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
      el.style.pointerEvents = style.opacity > 0.4 ? 'auto' : 'none';
    });
  }, [emblaApi, isLoopActive]);

  useEffect(() => {
    if (!emblaApi) return;

    applyStyles();
    emblaApi.on('scroll', applyStyles);
    emblaApi.on('settle', applyStyles);
    emblaApi.on('select', applyStyles);
    emblaApi.on('reInit', applyStyles);

    return () => {
      emblaApi.off('scroll', applyStyles);
      emblaApi.off('settle', applyStyles);
      emblaApi.off('select', applyStyles);
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
              className="flex-[0_0_70%] -mx-10 shrink-0 transform-gpu will-change-[transform,opacity]"
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
    </div>
  );
}

export default GalleryType2;
