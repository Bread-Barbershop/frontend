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
  isGuestPage?: boolean;
  onClick: () => void;
}

function SponsorshipInfomationPreview({
  blockInfo,
  className,
  isGuestPage = false,
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
      checkedSubTitle={blockInfo.props.isEnglishTitle}
      subTitle={blockInfo.props.englishTitle}
      subTitleDefault="OUR SPONSORS"
      mainTitle={blockInfo.props.title}
      mainTitleDefault="후원사"
      {...rest}
    >
      {(!displayPreview || displayPreview.length === 0) && !isGuestPage && (
        <div className="w-full flex justify-between">
          <div className="w-21 h-21 bg-border-neutral rounded-lg" />
          <div className="w-21 h-21 bg-border-neutral rounded-lg" />
          <div className="w-21 h-21 bg-border-neutral rounded-lg" />
        </div>
      )}
      {displayPreview.length === 1 &&
        displayPreview.map((item, index) => (
          <div key={index} className={`w-21 h-21 flex-center`}>
            <Image
              src={item}
              alt="후원사 로고 이미지"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      {displayPreview.length > 1 && (
        <AutoScrollCarousel className="h-21 w-full" carouselClassName="gap-10">
          {displayPreview.map((item, index) => (
            <div
              key={index}
              className={`min-w-0 flex-[0_0_26%] ${index === 0 ? 'ml-10' : ''}`}
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
      )}
    </MiddlePreviewWrapper>
  );
}

export default SponsorshipInfomationPreview;
