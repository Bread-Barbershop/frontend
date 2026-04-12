import { useMemo, type HTMLAttributes } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { InterviewPreviewItem } from './InterviewPreviewItem';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'interview'>;
  className: string;
  titleClassName?: string;
}

export const InterviewPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { title, questions } = blockInfo.props;

  const displayItems = useMemo(() => {
    if (questions && questions.length === 2) {
      return [...questions, ...questions, ...questions, ...questions];
    }
    return questions;
  }, [questions]);

  const isAutoScrollActive = (questions?.length ?? 0) > 1;

  return (
    <MiddlePreviewWrapper
      className={cn('px-0', className)}
      enTitle="INTERVIEW"
      koTitle={title}
      titleClassName={titleClassName}
      {...rest}
    >
      <div className="w-full flex justify-center relative overflow-hidden">
        <Carousel
          options={{
            align: 'center',
            containScroll: false,
            loop: isAutoScrollActive,
          }}
          isButtonShow={false}
          className="h-full w-full"
          carouselClassName="gap-3"
          autoscroll={isAutoScrollActive}
          autoscrollOptions={{
            speed: 1,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
            stopOnFocusIn: false,
          }}
          loop={isAutoScrollActive}
        >
          {displayItems?.map((question, index) => (
            <div
              key={`${question.questionId}-${index}`}
              className={cn(
                'w-full',
                (displayItems?.length ?? 0) > 1 && index === 0 ? 'ml-3' : '',
                (displayItems?.length ?? 0) === 1 && 'flex-center'
              )}
            >
              <InterviewPreviewItem
                question={question.question}
                answerHtml={question.answer.messageHtml || ''}
                image={question.image}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </MiddlePreviewWrapper>
  );
};
