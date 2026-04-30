import { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect } from 'react';

import { Image } from '@/components/atoms/image';

import { GalleryTemplateProps } from '../types/galleryType';

const MAX_WIDTH = 240; // 중앙일 때 카드 폭
const MIN_WIDTH = 32; // 가장 멀어졌을 때 카드 폭

const RATIO_MAP: Record<string, number> = {
  '1:1': 1,
  '3:4': 4 / 3,
  '4:3': 3 / 4,
  '16:9': 9 / 16,
  '9:16': 16 / 9,
};

function GalleryType3({ imageClick, preview, ratio }: GalleryTemplateProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: false,
  });

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
    emblaApi.on('select', handler).on('reInit', handler);
    handler();
    return () => {
      emblaApi.off('select', handler).off('reInit', handler);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full">
      <div ref={emblaRef} className="overflow-hidden">
        <div
          className="flex items-stretch gap-2 transition-[height] duration-300"
          style={{ height: rowHeight }}
        >
          {preview.map((src, i) => (
            <div key={i} className="flex-[0_0_auto] flex">
              <div
                data-card
                role="button"
                tabIndex={0}
                onClick={() => imageClick(i)}
                className="h-full overflow-hidden rounded-lg bg-white shadow-md relative transition-[width] duration-300"
                style={{ width: `${MIN_WIDTH}px` }}
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
export default GalleryType3;
