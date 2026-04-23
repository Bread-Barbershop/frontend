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
}

export const SpeakerInformationPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { title, speakers, images, checkedEnglishTitle, englishTitle } =
    blockInfo.props;

  const displayItems = useMemo(() => {
    if (speakers && speakers.length === 2) {
      return [...speakers, ...speakers, ...speakers, ...speakers];
    }
    return speakers;
  }, [speakers]);

  const isAutoScrollActive = (speakers?.length ?? 0) > 1;

  const carouselOptions: EmblaOptionsType = useMemo(
    () => ({
      align: 'center',
      containScroll: false,
      loop: isAutoScrollActive,
    }),
    [isAutoScrollActive]
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
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="SPEAKER INFORMATION"
      koTitle={title}
      koTitleDefault="연사정보"
      titleClassName={titleClassName}
      {...rest}
    >
      <div className="w-full flex justify-center relative overflow-hidden">
        <Carousel
          options={carouselOptions}
          isButtonShow={false}
          className="h-full w-full"
          carouselClassName="gap-3"
          autoscroll={isAutoScrollActive}
          autoscrollOptions={autoscrollOptions}
          loop={isAutoScrollActive}
        >
          {displayItems?.map((speaker, index) => (
            <div
              key={`${speaker.id}-${index}`}
              className={cn(
                'w-full',
                (displayItems?.length ?? 0) > 1 && index === 0 ? 'ml-3' : '',
                (displayItems?.length ?? 0) === 1 && 'flex-center'
              )}
            >
              <InformationPreview
                speaker={speaker}
                images={images}
                index={index % (speakers?.length || 1)}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </MiddlePreviewWrapper>
  );
};
