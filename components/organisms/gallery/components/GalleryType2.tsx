import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useRef } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

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

  // abs가 3 이상이면 숨김
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

function GalleryType2({ preview, ratio, imageClick }: GalleryTemplateProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: false,
  });

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyStyles = useCallback(() => {
    if (!emblaApi) return;

    const scrollProgress = emblaApi.scrollProgress();
    const slidesCount = emblaApi.slideNodes().length;

    // scrollProgress 0~1을 슬라이드 인덱스로 변환
    const maxIndex = slidesCount - 1;
    const currentCenter = scrollProgress * maxIndex;

    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const distance = i - currentCenter; // 중앙에서의 거리
      const style = getSlideStyle(distance);

      el.style.opacity = `${style.opacity}`;
      el.style.transform = `scale(${style.scale}) rotate(${style.rotate}deg)`;
      el.style.zIndex = `${style.z}`;
      el.style.pointerEvents = style.opacity > 0.5 ? 'auto' : 'none';
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    applyStyles(); // 초기 적용

    // scroll 이벤트 = 드래그 중에도 계속 발생
    emblaApi.on('scroll', applyStyles);
    emblaApi.on('reInit', applyStyles);

    return () => {
      emblaApi.off('scroll', applyStyles);
      emblaApi.off('reInit', applyStyles);
    };
  }, [emblaApi, applyStyles]);

  return (
    <div className="w-full min-h-[120px]">
      <div ref={emblaRef} className="py-10 overflow-hidden">
        <div className="flex items-center px-[20%]">
          {preview.map((src, i) => (
            <div
              key={i}
              ref={el => {
                slideRefs.current[i] = el;
              }}
              className="flex-[0_0_70%] -mx-10"
              style={{ transformOrigin: 'bottom center', transition: 'none' }}
            >
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  'relative overflow-hidden rounded-lg min-h-[120px] shadow-gallery-image',
                  GalleryItemVariants({ ratio })
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

export default GalleryType2;
