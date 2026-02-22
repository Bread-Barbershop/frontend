import { EmblaCarouselType } from 'embla-carousel';
import { useCallback } from 'react';

import { GalleryVariant } from '../types/galleryType';

export const useCarouselOnScroll = (variant: GalleryVariant) => {
  const slideReset = (slide: HTMLElement) => {
    if (slide.style.transform) slide.style.transform = '';
    if (slide.style.zIndex) slide.style.zIndex = '';
    if (slide.style.borderRadius) slide.style.borderRadius = '';
    if (slide.style.flex) slide.style.flex = '';
    if (slide.style.height) slide.style.height = '';
    if (slide.style.aspectRatio) slide.style.aspectRatio = '';
    if (slide.style.opacity) slide.style.opacity = '';
    if (slide.style.transition) slide.style.transition = '';
    if (slide.style.padding) slide.style.padding = '';
  };

  const onScroll = useCallback(
    (emblaApi: EmblaCarouselType) => {
      if (!emblaApi) return;

      const progress = emblaApi.scrollProgress();
      const slides = emblaApi.slideNodes();
      const selectedIndex = emblaApi.selectedScrollSnap();

      slides.forEach((slide, index) => {
        slideReset(slide);
        const snap = emblaApi.scrollSnapList()[index];
        switch (variant) {
          case 'galleryType1': {
            const diffToTarget = Math.abs(snap - progress);
            const scale = 1 - Math.min(diffToTarget * 0.5, 0.2);
            slide.style.transform = `scale(${scale})`;
            break;
          }
          case 'galleryType2': {
            const diff = snap - progress;
            const diffToTarget = Math.abs(snap - progress);
            const zIndex = Math.max(0, 10 - Math.round(diffToTarget * 5));
            const rotate = diff * 10;
            const scale = 1 - Math.min(diffToTarget * 1.5, 0.2);
            slide.style.zIndex = zIndex.toString();
            slide.style.transform = `rotate(${rotate}deg) scale(${scale}) translateY(${diffToTarget * 100}px) translateX(${
              -diff * 250
            }%)`;
            break;
          }
          case 'galleryType3': {
            if (index === selectedIndex) {
              slide.style.aspectRatio = '1/1';
              slide.style.flex = `0 0 60%`;
              // slide.style.transition = `all 0.5s cubic-bezier(0.22, 1, 0.36, 1)`;
            } else {
              slide.style.aspectRatio = '1/6';
              slide.style.flex = `0 0 10%`;
              // slide.style.transition = `all 0.5s cubic-bezier(0.22, 1, 0.36, 1)`;
            }
            break;
          }
          case 'galleryType4': {
            slideReset(slide);
            break;
          }
          case 'galleryType5': {
            const rotate = 2 * (index % 2 === 0 ? 1 : -1);

            slide.style.transform = `rotate(${rotate}deg)`;
            break;
          }
          default:
            break;
        }
      });
    },
    [variant]
  );

  return { onScroll };
};
