import { EmblaOptionsType } from 'embla-carousel';
import { useMemo } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { NoticePreviewItem } from './NoticePreviewItem';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'notice'>;
  className: string;
  titleClassName?: string;
}

export const NoticePreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { items, title, images } = blockInfo.props;

  const displayItems = useMemo(() => {
    if (items && items.length === 2) {
      return [...items, ...items, ...items, ...items];
    }
    return items;
  }, [items]);

  const isAutoScrollActive = (items?.length ?? 0) > 1;

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
      enTitle="NOTICE"
      koTitle={title}
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
          {displayItems?.map((item, index) => (
            <div
              key={`preview-${item.id}-${index}`}
              className={cn(
                'w-full',
                displayItems.length > 1 && index === 0 ? 'ml-3' : '',
                displayItems.length === 1 && 'flex-center'
              )}
            >
              <NoticePreviewItem
                item={item}
                images={images}
                index={index % (items?.length || 1)}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </MiddlePreviewWrapper>
  );
};
