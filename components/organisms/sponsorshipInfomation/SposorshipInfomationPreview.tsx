import React from 'react';

import { Image } from '@/components/atoms/image';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  blockInfo: EditorBlock<'sponsorshipInfomation'>;
  className: string;
  titleClassName: string;
  onClick: () => void;
}

function SponsorshipInfomationPreview({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) {
  const preview = useResolvedImageSources(blockInfo.props.images);

  return (
    <MiddlePreviewWrapper
      className={className}
      koTitle={blockInfo.props.title}
      titleClassName={titleClassName}
      {...rest}
    >
      <Carousel
        options={{ align: 'center', containScroll: false, loop: true }}
        isButtonShow={false}
        className="h-21 w-full"
        carouselClassName="gap-3"
      >
        {preview.map((item, index) => (
          <div
            key={index}
            className={`min-w-0 w-21 h-21 flex-[0_0_30%] rounded-lg ${index === 0 ? 'ml-3' : ''}`}
          >
            <Image
              src={item}
              alt="후원사 로고 이미지"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </Carousel>
    </MiddlePreviewWrapper>
  );
}

export default SponsorshipInfomationPreview;
