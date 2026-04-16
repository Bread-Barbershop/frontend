import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType1({ ratio, preview, imageClick }: GalleryTemplateProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: false,
  });
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      emblaApi.slideNodes().forEach((node, index) => {
        node.style.transform =
          index === selectedIndex ? 'scale(1)' : 'scale(0.8)';
        node.style.transition = 'transform 0.3s ease';
      });
    };

    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect).off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="w-full min-h-[120px] overflow-hidden py-8">
      <div ref={emblaRef}>
        <div className="flex items-center">
          {preview.map((src, i) => (
            <div key={i} className="flex-[0_0_70%]">
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  'relative overflow-hidden rounded-lg min-h-[120px] shadow-gallery-image',
                  GalleryItemVariants({
                    ratio: ratio,
                  })
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

export default GalleryType1;
