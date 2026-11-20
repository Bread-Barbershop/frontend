import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { InformationPreview } from './InformationPreview';
import { SpeakerPairCarousel } from './SpeakerPairCarousel';

import type { EmblaOptionsType } from 'embla-carousel';
import type { HTMLAttributes } from 'react';

const carouselOptions: EmblaOptionsType = { align: 'center', containScroll: false };
const autoscrollOptions = {
  speed: 1,
  stopOnInteraction: false,
  stopOnMouseEnter: false,
  stopOnFocusIn: false,
};

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'speakerInformation'>;
  className: string;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export const SpeakerInformationPreview = ({
  blockInfo,
  className,
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) => {
  const { title, speakers, checkedSubTitle, subTitle } = blockInfo.props;
  const speakerCount = speakers?.length ?? 0;
  const isSpeakerPair = speakerCount === 2;
  const autoScroll = speakerCount > 2;

  const cards = speakers?.map((speaker, index) => (
    <div
      key={`${speaker.id}-${index}`}
      className={cn(
        'w-full',
        isSpeakerPair && 'min-w-0 shrink-0 snap-start overflow-clip',
        autoScroll && index === 0 && 'ml-3',
        speakerCount === 1 && 'flex-center'
      )}
    >
      <InformationPreview speaker={speaker} isGuestPage={isGuestPage} />
    </div>
  ));

  return (
    <MiddlePreviewWrapper
      className={cn('px-0', className)}
      checkedSubTitle={checkedSubTitle}
      subTitle={subTitle}
      subTitleDefault="SPEAKER INFORMATION"
      mainTitle={title}
      mainTitleDefault="연사정보"
      titleClassName={cn('px-5', titleClassName)}
      {...rest}
    >
      <div className="w-full flex justify-center relative overflow-hidden px-px">
        {autoScroll ? (
          <Carousel
            options={carouselOptions}
            isButtonShow={false}
            className="h-full w-full"
            carouselClassName="gap-3"
            autoscroll
            autoscrollOptions={autoscrollOptions}
            loop
          >
            {cards}
          </Carousel>
        ) : isSpeakerPair ? (
          <SpeakerPairCarousel>{cards}</SpeakerPairCarousel>
        ) : (
          cards
        )}
      </div>
    </MiddlePreviewWrapper>
  );
};
