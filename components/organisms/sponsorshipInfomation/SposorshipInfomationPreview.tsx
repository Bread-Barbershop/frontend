import React from 'react';

import { Image } from '@/components/atoms/image';
import AutoScrollCarousel from '@/features/EmblaCarousel/AutoScrollCarousel/AutoScrollCarousel';
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  blockInfo: EditorBlock<'sponsorshipInfomation'>;
  className: string;
  titleClassName?: string;
  onClick: () => void;
}

function SponsorshipInfomationPreview({
  blockInfo,
  className,
  ...rest
}: Props) {
  const preview = useResolvedImageSources(blockInfo.props.images);
  const displayPreview =
    preview.length <= 4 && preview.length >= 2
      ? [...preview, ...preview]
      : preview;

  return (
    <MiddlePreviewWrapper
      className={className}
      checkedEnglishTitle={blockInfo.props.isEnglishTitle}
      enTitle={blockInfo.props.englishTitle}
      enTitleDefault="OUR SPONSORS"
      koTitle={blockInfo.props.title}
      koTitleDefault="후원사"
      {...rest}
    >
      <AutoScrollCarousel className="h-21 w-full" carouselClassName="gap-10">
        {displayPreview.map((item, index) => (
          <div
            key={index}
            className={`min-w-0 flex-[0_0_26%] rounded-lg ${index === 0 ? 'ml-10' : ''}`}
          >
            <Image
              src={item}
              alt="후원사 로고 이미지"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </AutoScrollCarousel>
    </MiddlePreviewWrapper>
  );
}

export default SponsorshipInfomationPreview;
