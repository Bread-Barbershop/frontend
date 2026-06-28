import { EmblaOptionsType } from 'embla-carousel';
import { useMemo } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { getNoticeDefaultImage } from './noticeList';
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
  const { noticeList, title, checkedSubTitle, subTitle } =
    blockInfo.props;
  const isSingleNotice = (noticeList?.length ?? 0) === 1;

  const displayNoticeList = useMemo(() => {
    if (noticeList && noticeList.length === 2) {
      return [...noticeList, ...noticeList, ...noticeList, ...noticeList];
    }
    return noticeList;
  }, [noticeList]);

  const isAutoScrollActive = (noticeList?.length ?? 0) > 1;

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
      speed: 0.5,
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
      subTitleDefault="INFORMATION"
      mainTitle={title}
      mainTitleDefault="공지사항"
      titleClassName={cn('px-5', titleClassName)}
      {...rest}
    >
      <div className="w-full flex justify-center relative overflow-hidden px-px">
        <Carousel
          options={carouselOptions}
          isButtonShow={false}
          className="h-full w-full"
          carouselClassName="gap-6"
          autoscroll={isAutoScrollActive}
          autoscrollOptions={autoscrollOptions}
          loop={isAutoScrollActive}
        >
          {displayNoticeList?.map((notice, index) => (
            <div
              key={`preview-${notice.id}-${index}`}
              className={cn(
                isSingleNotice ? 'mx-auto w-[calc(100%-40px)]' : 'w-full',
                (displayNoticeList?.length ?? 0) > 1 && index === 0
                  ? 'ml-6'
                  : '',
                isSingleNotice && 'flex-center'
              )}
            >
              <NoticePreviewItem
                notice={notice}
                defaultImage={getNoticeDefaultImage(notice)}
                className={isSingleNotice ? 'w-full' : 'w-70'}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </MiddlePreviewWrapper>
  );
};
