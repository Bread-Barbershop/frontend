import { useState } from 'react';

import { PicturePopViewer } from '@/components/molecules/picture/PicturePopViewer';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { GalleryTemplate } from './components';
import ImageDefault from './components/ImageDefault';
import { GalleryVariant, RatioType } from './types/galleryType';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  className: string;
  titleClassName?: string;
  isGuestPage?: boolean;
  onClick: () => void;
}

function GalleryPreview({
  blockInfo,
  className,
  titleClassName,
  isGuestPage = false,
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
  const TemplateComponent =
    GalleryTemplate[variant] || GalleryTemplate['galleryType1'];

  return (
    <MiddlePreviewWrapper
      className={cn(className, 'px-0')}
      checkedSubTitle={blockInfo.props.isEnglishTitle}
      subTitle={blockInfo.props.enTitle}
      subTitleDefault="GALLERY"
      mainTitle={blockInfo.props.title}
      mainTitleDefault="갤러리"
      titleClassName={cn('px-5', titleClassName)}
      {...rest}
    >
      {preview.length === 0 && !isGuestPage && <ImageDefault />}
      {preview.length !== 0 && (
        <TemplateComponent
          preview={preview}
          ratio={ratio}
          imageClick={handleImageClick}
        />
      )}

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
