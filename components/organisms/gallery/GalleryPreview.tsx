import { EmblaCarouselType } from 'embla-carousel';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

import { PicturePopViewer } from '@/components/molecules/picture/PicturePopViewer';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { cn } from '@/shared/utils/cn';
import { EditorBlock } from '@/widgets/editor/store/useEditorStore';

import { GalleryCarouselVariants } from './GalleryCarouselType';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  className: string;
}

//캐싱된 URL 고려해야함
function GalleryPreview({ blockInfo, className, ...rest }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const preview = useMemo(() => {
    return (blockInfo.props.images ?? []).map(file =>
      URL.createObjectURL(file)
    );
  }, [blockInfo.props.images]);

  const variant = blockInfo.props.template ?? 'galleryType1';
  const ratio = blockInfo.props.ratio ?? '1/1';

  const onScroll = useCallback(
    (emblaApi: EmblaCarouselType) => {
      if (!emblaApi) return;

      const progress = emblaApi.scrollProgress();
      const slides = emblaApi.slideNodes();
      const selectedIndex = emblaApi.selectedScrollSnap();

      slides.forEach((slide, index) => {
        slide.style.transform = '';
        slide.style.zIndex = '';
        slide.style.borderRadius = '';
        slide.style.flex = '';
        slide.style.height = '';
        slide.style.aspectRatio = '';
        slide.style.opacity = '';
        slide.style.transition = '';
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
            break;
          }
          case 'galleryType5': {
            const rotate = 3 * (index % 2 === 0 ? 1 : -1);
            slide.style.transform = `rotate(${rotate}deg)`;
            break;
          }
          case 'galleryType6':
            break;
          default:
            break;
        }
      });
    },
    [variant]
  );

  return (
    <div className={`w-full ${className} relative`} {...rest}>
      <div className="flex flex-col gap-6 py-8 px-5">
        <div className="flex-center flex-col gap-1">
          <p className="text-text-wedding text-[13px] font-semibold">GALLERY</p>
          <p className="text-text-wedding text-[20px] font-semibold">
            {blockInfo.props.title}
          </p>
        </div>
        <div
          className={`w-full ${preview.length === 0 ? 'bg-border-neutral' : ''} flex-center`}
        >
          <Carousel
            options={{ align: 'center', containScroll: false }}
            onScroll={onScroll}
            carouselClassName={cn({
              'gap-2': variant === 'galleryType4' || variant === 'galleryType3',
            })}
          >
            {preview.length > 0 &&
              preview.map((file, index) => (
                <div
                  key={index}
                  className={cn(
                    GalleryCarouselVariants({ variant: variant, ratio: ratio })
                  )}
                  onClick={() => {
                    setActiveIndex(index);
                    if (blockInfo.props.isPopupViewer) {
                      setIsOpen(true);
                    }
                  }}
                >
                  <Image
                    src={file}
                    alt="갤러리 이미지"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            {preview.length === 0 && (
              <div className="flex-center w-full h-31.5">
                사진을 추가해주세요
              </div>
            )}
          </Carousel>
        </div>
      </div>
      {blockInfo.props.isPopupViewer && (
        <PicturePopViewer
          isOpen={isOpen}
          images={preview}
          startIndex={activeIndex}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
export default GalleryPreview;
