import { useMemo, useState } from 'react';

import { Image } from '@/components/atoms/image';
import { PicturePopViewer } from '@/components/molecules/picture/PicturePopViewer';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { cn } from '@/shared/utils/cn';
import { EditorBlock } from '@/widgets/editor/store/useEditorStore';

import { GalleryCarouselVariants } from './GalleryCarouselType';
import { useCarouselOnScroll } from './hooks/useCarouselOnScroll';
import { GalleryVariant, RatioType } from './types/galleryType';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  className: string;
  titleClassName: string;
  onClick: () => void;
}

//캐싱된 URL 고려해야함
function GalleryPreview({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const preview = useMemo(() => {
    return (blockInfo.props.images ?? []).map(file =>
      URL.createObjectURL(file)
    );
  }, [blockInfo.props.images]);

  const variant = (blockInfo.props.template ??
    'galleryType1') as GalleryVariant;
  const ratio = (blockInfo.props.ratio ?? '1:1') as RatioType;

  const { onScroll } = useCarouselOnScroll(variant);

  return (
    <div className={`w-full ${className} relative`} {...rest}>
      <div className="flex flex-col gap-6 py-8 px-5">
        <div className="flex-center flex-col gap-1">
          <p className={cn(`text-text-wedding sub-title`, titleClassName)}>
            GALLERY
          </p>
          <p className={cn(`text-text-wedding main-title`, titleClassName)}>
            {blockInfo.props.title}
          </p>
        </div>
        <div
          className={cn(
            'w-full flex-center',
            preview.length === 0 ? 'bg-border-neutral' : '',
            variant === 'galleryType3' &&
              GalleryCarouselVariants({ ratio })
                .split(' ')
                .find(c => c.startsWith('aspect-'))
          )}
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
                    GalleryCarouselVariants({
                      variant: variant,
                      ratio: variant === 'galleryType3' ? 'none' : ratio,
                    })
                  )}
                  onClick={() => {
                    setActiveIndex(index);
                    if (blockInfo.props.isPopupViewer) {
                      setIsOpen(true);
                    }
                  }}
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
          ratio={ratio}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
export default GalleryPreview;
