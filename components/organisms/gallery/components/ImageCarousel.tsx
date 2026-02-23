import React from 'react';

import { Image } from '@/components/atoms/image';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { cn } from '@/shared/utils/cn';

import {
  GalleryItemVariants,
  GalleryLayoutVariants,
} from '../GalleryCarouselType';
import { useCarouselOnScroll } from '../hooks/useCarouselOnScroll';
import { GalleryVariant, RatioType } from '../types/galleryType';

interface Props {
  preview: string[];
  variant: GalleryVariant;
  ratio: RatioType;
  imageClick: (index: number) => void;
}

function ImageCarousel({ preview, variant, ratio, imageClick }: Props) {
  const { onScroll } = useCarouselOnScroll(variant);

  // 모든 캐러셀 타입(1, 2, 3, 4, 5)에 대해 슬라이드 너비 비중을 고려하여 컨테이너 높이 보정
  // R_target = 사용자가 선택한 비율 (W/H)
  // W_item = 전체 컨테이너 대비 슬라이드 너비 비중 (70% = 0.7, 60% = 0.6)
  // H_container = W_item / R_target
  // R_container = 1 / H_container = R_target / W_item
  const getContainerStyles = () => {
    const [w, h] = ratio.split(':').map(Number);
    const targetRatio = w / h;

    // 타입별 너비 비중 결정
    let itemWidthWeight = 0.7; // galleryType1, 2, 4, 5 (70%)
    if (variant === 'galleryType3') itemWidthWeight = 0.6; // galleryType3 (60%)

    const containerAspectRatio = targetRatio / itemWidthWeight;

    return { aspectRatio: `${containerAspectRatio.toFixed(4)} / 1` };
  };

  return (
    <div
      className={cn(
        'w-full flex-center overflow-hidden',
        preview.length === 0 ? 'bg-border-neutral' : ''
      )}
      style={getContainerStyles()}
    >
      <Carousel
        options={{ align: 'center', containScroll: false }}
        onScroll={onScroll}
        carouselClassName={cn(
          'h-full w-full',
          GalleryLayoutVariants({ variant }), // Carousel 내부 컨테이너 레이아웃
          {
            'gap-2': variant === 'galleryType4' || variant === 'galleryType3',
          }
        )}
      >
        {preview.length > 0 &&
          preview.map((file, index) => (
            <div
              key={index}
              className={cn(
                'h-full',
                GalleryItemVariants({
                  variant: variant,
                  ratio: 'none',
                })
              )}
              onClick={() => imageClick(index)}
            >
              {variant === 'galleryType5' && (
                <div className="flex flex-col w-full h-[95%] p-2 pb-8 bg-bg-base shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_4px_0_rgba(0,0,0,0.08),0_8px_24px_0_rgba(0,0,0,0.1)] rounded-sm">
                  <div className="relative flex-1 w-full overflow-hidden rounded-sm">
                    <Image
                      src={file}
                      alt="갤러리 이미지"
                      fill
                      className="object-cover "
                    />
                  </div>
                </div>
              )}
              {variant !== 'galleryType5' && (
                <Image
                  src={file}
                  alt="갤러리 이미지"
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </div>
          ))}
      </Carousel>
    </div>
  );
}

export default ImageCarousel;
