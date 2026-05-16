import { EmblaOptionsType } from 'embla-carousel';
import { useMemo, useState, type HTMLAttributes } from 'react';

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
  const { title, questions, checkedEnglishTitle, englishTitle } =
    blockInfo.props;
  const questionCount = questions?.length ?? 0;
  const isMultiple = questionCount > 1;
  const [openQuestionIds, setOpenQuestionIds] = useState<
    Record<string, boolean>
  >({});

  const displayItems = useMemo(() => {
    if (questions && questions.length === 2) {
      return [...questions, ...questions, ...questions, ...questions];
    }
    return questions;
  }, [questions]);

  const carouselOptions: EmblaOptionsType = useMemo(
    () => ({
      align: 'center',
      containScroll: isMultiple ? false : 'trimSnaps',
      loop: isMultiple,
    }),
    [isMultiple]
  );

  const handleToggleOpen = (questionId: string) => {
    setOpenQuestionIds(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <MiddlePreviewWrapper
      className={cn('px-0', className)}
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="INTERVIEW"
      koTitle={title}
      koTitleDefault="인터뷰"
      titleClassName={titleClassName}
      {...rest}
    >
      <div className="w-full flex justify-center relative overflow-hidden px-px">
        <Carousel
          options={carouselOptions}
          isButtonShow={false}
          className="h-full w-full"
          loop={isMultiple}
        >
          {displayItems?.map((question, index) => (
            <div
              key={`${question.id}-${index}`}
              className={cn(
                'shrink-0 min-w-0',
                isMultiple
                  ? 'w-70 mr-6'
                  : 'mx-auto w-[calc(100%-40px)] flex-center'
              )}
            >
              <InterviewPreviewItem
                question={question.question}
                answerHtml={question.answer.messageHtml || ''}
                image={question.image}
                isOpen={openQuestionIds[question.id] ?? false}
                className={isMultiple ? 'w-70' : 'w-full'}
                onToggle={() => handleToggleOpen(question.id)}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </MiddlePreviewWrapper>
  );
};
