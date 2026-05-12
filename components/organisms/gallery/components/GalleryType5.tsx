import { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType5({ imageClick, preview, ratio }: GalleryTemplateProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: false,
  });

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    const slides = emblaApi.slideNodes();
    slides.forEach((slide, index) => {
      // 슬라이드 자체가 아니라 내부 자식(data-rotate-target)에 적용
      const target = slide.querySelector<HTMLElement>('[data-rotate-target]');
      if (!target) return;
      const rotate = 6 * (index % 2 === 0 ? 1 : -1);
      target.style.transform = `rotate(${rotate}deg)`;
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => onScroll(emblaApi);
    emblaApi.on('reInit', handler);
    onScroll(emblaApi);
    return () => {
      emblaApi.off('reInit', handler);
    };
  }, [emblaApi, onScroll]);

  return (
    <div className="w-full min-h-[120px]">
      {/* overflow-hidden을 viewport로 이동 */}
      <div ref={emblaRef} className="overflow-hidden py-10">
        <div className="flex items-center py-8">
          {preview.map((src, i) => (
            // -mx-1 제거, 대신 내부 padding으로 간격 확보
            <div key={i} className="flex-[0_0_40%] min-w-0 -mx-1">
              <div
                data-rotate-target
                role="button"
                tabIndex={0}
                style={{ margin: '0 -4px' }}
                className={cn(
                  'relative overflow-hidden p-2 pb-6 bg-bg-base rounded-sm min-h-[120px] shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_4px_0_rgba(0,0,0,0.08),0_8px_24px_0_rgba(0,0,0,0.1)]',
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
export default GalleryType5;
