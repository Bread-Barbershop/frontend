import { useState } from 'react';

import { PicturePopViewer } from '@/components/molecules/picture/PicturePopViewer';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';
import { EditorBlock } from '@/shared/types/block';

import ImageCarousel from './components/ImageCarousel';
import ImageDefault from './components/ImageDefault';
import ImageGrid from './components/ImageGrid';
import { GalleryVariant, RatioType } from './types/galleryType';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  className: string;
  titleClassName?: string;
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

  const preview = useResolvedImageSources(blockInfo.props.images);

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
    <MiddlePreviewWrapper
      className={className}
      enTitle="GALLERY"
      koTitle={blockInfo.props.title}
      titleClassName={titleClassName}
      {...rest}
    >
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
    </MiddlePreviewWrapper>
  );
}
export default GalleryPreview;
