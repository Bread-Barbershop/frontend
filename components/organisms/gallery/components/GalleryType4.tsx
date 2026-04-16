import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType4({ imageClick, preview, ratio }: GalleryTemplateProps) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: false,
  });
  return (
    <div className="w-full min-h-[120px] overflow-hidden py-8">
      <div ref={emblaRef}>
        <div className="flex items-center gap-5">
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

export default GalleryType4;
