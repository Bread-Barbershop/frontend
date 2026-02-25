import { useMemo, useState } from 'react';

import { PicturePopViewer } from '@/components/molecules/picture/PicturePopViewer';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import ImageCarousel from './components/ImageCarousel';
import ImageDefault from './components/ImageDefault';
import ImageGrid from './components/ImageGrid';
import { GalleryVariant, RatioType } from './types/galleryType';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  className: string;
  titleClassName: string;
  onClick: () => void;
}

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

  const handleImageClick = (index: number) => {
    setActiveIndex(index);
    if (blockInfo.props.isPopupViewer) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn('w-full relative', className)} {...rest}>
      <div className="flex flex-col gap-6 py-8 px-5">
        <div className="flex-center flex-col gap-1">
          <p className={cn(`text-text-wedding sub-title`, titleClassName)}>
            GALLERY
          </p>
          <p className={cn(`text-text-wedding main-title`, titleClassName)}>
            {blockInfo.props.title}
          </p>
        </div>
        <div className="w-full ">
          {preview.length === 0 && <ImageDefault />}
          {preview.length !== 0 &&
            (variant === 'galleryType1' ||
            variant === 'galleryType2' ||
            variant === 'galleryType3' ||
            variant === 'galleryType4' ||
            variant === 'galleryType5' ? (
              <ImageCarousel
                preview={preview}
                variant={variant}
                ratio={ratio}
                imageClick={handleImageClick}
              />
            ) : (
              <ImageGrid
                variant={variant}
                preview={preview}
                ratio={ratio}
                imageClick={handleImageClick}
              />
            ))}
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
