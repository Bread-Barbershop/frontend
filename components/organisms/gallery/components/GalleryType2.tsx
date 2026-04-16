import ClassNames from 'embla-carousel-class-names';
import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { GalleryTemplateProps } from '../types/galleryType';

function GalleryType2({ preview, ratio, imageClick }: GalleryTemplateProps) {
  const [emblaRef] = useEmblaCarousel(
    { loop: false, align: 'center', containScroll: false },
    [ClassNames()]
  );

  return (
    <div className="w-full min-h-[120px] overflow-hidden py-8">
      <div ref={emblaRef}>
        <div className="flex items-center">
          {preview.map((src, i) => (
            <div key={i} className="embla__slide flex-[0_0_60%] -mx-6">
              <div
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

export default GalleryType2;
