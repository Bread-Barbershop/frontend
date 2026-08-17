import { EmblaOptionsType } from 'embla-carousel';
import { useMemo, type HTMLAttributes } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { InformationPreview } from './InformationPreview';

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
  const { title, speakers, checkedSubTitle, subTitle } =
    blockInfo.props;

  const displayItems = useMemo(() => {
    if (speakers && speakers.length === 2) {
      return [...speakers, ...speakers, ...speakers, ...speakers];
    }
    return speakers;
  }, [speakers]);

  const isCarouselActive = (speakers?.length ?? 0) > 1;

  const carouselOptions: EmblaOptionsType = useMemo(
    () => ({
      align: 'center',
      containScroll: false,
      loop: isCarouselActive,
    }),
    [isCarouselActive]
  );

  const autoscrollOptions = useMemo(
    () => ({
      speed: 1,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
    []
  );

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
        {isCarouselActive ? (
          <Carousel
            options={carouselOptions}
            isButtonShow={false}
            className="h-full w-full"
            carouselClassName="gap-3"
            autoscroll
            autoscrollOptions={autoscrollOptions}
            loop
          >
            {displayItems?.map((speaker, index) => (
              <div
                key={`${speaker.id}-${index}`}
                className={cn('w-full', index === 0 ? 'ml-3' : '')}
              >
                <InformationPreview
                  speaker={speaker}
                  isGuestPage={isGuestPage}
                />
              </div>
            ))}
          </Carousel>
        ) : (
          speakers?.map(speaker => (
            <div key={speaker.id} className="w-full flex-center">
              <InformationPreview speaker={speaker} isGuestPage={isGuestPage} />
            </div>
          ))
        )}
      </div>
    </MiddlePreviewWrapper>
  );
};
