import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { NoticePreviewItem } from './NoticePreviewItem';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'notice'>;
  className: string;
  titleClassName: string;
}

export const NoticePreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { items, title, images } = blockInfo.props;

  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="NOTICE"
      koTitle={title}
      titleClassName={titleClassName}
      {...rest}
    >
      <div className="w-full flex-center relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-linear-to-r from-white/90 to-transparent" />
        <Carousel
          options={{ align: 'center', containScroll: false, loop: true }}
          isButtonShow={false}
          className="h-full w-full"
          carouselClassName="gap-3"
        >
          {items?.map((item, index) => (
            <div
              key={`preview-${item.id}`}
              className={cn(
                'min-w-0 flex-[0_0_82%]',
                index === 0 ? 'ml-3' : ''
              )}
            >
              <NoticePreviewItem item={item} images={images} index={index} />
            </div>
          ))}
        </Carousel>
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-linear-to-l from-white/90 to-transparent" />
      </div>
    </MiddlePreviewWrapper>
  );
};
