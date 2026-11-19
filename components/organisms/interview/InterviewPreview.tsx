import { EmblaOptionsType } from 'embla-carousel';
import { useMemo, useState, type HTMLAttributes } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { getInterviewCard } from './interviewContent';
import { getInterviewDefaultImage } from './interviewList';
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
  const { title, questions, checkedSubTitle, subTitle } = blockInfo.props;
  const cards = useMemo(
    () =>
      (questions ?? []).flatMap(question => {
        const card = getInterviewCard(question);
        return card ? [card] : [];
      }),
    [questions]
  );
  const isMultiple = cards.length > 1;
  const [openQuestionIds, setOpenQuestionIds] = useState<
    Record<string, boolean>
  >({});

  const displayItems = useMemo(() => {
    if (cards.length === 2) {
      return [...cards, ...cards, ...cards, ...cards];
    }
    return cards;
  }, [cards]);

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
      checkedSubTitle={checkedSubTitle}
      subTitle={subTitle}
      subTitleDefault="INTERVIEW"
      mainTitle={title}
      mainTitleDefault="인터뷰"
      titleClassName={cn('px-5', titleClassName)}
      {...rest}
    >
      <div className="w-full flex justify-center relative overflow-hidden px-px">
        <Carousel
          options={carouselOptions}
          isButtonShow={false}
          className="h-full w-full"
          loop={isMultiple}
        >
          {displayItems.map((question, index) => (
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
                answerHtml={question.answerHtml}
                image={question.image}
                defaultImage={getInterviewDefaultImage(question)}
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
