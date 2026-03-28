import { useState, type HTMLAttributes } from 'react';

import { Button } from '@/components/atoms/button';
import { Image } from '@/components/atoms/image';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'interview'>;
  className: string;
  titleClassName: string;
}

export const InterviewPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { title, questions, image } = blockInfo.props;
  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );
  const [openInterview, setOpenInterview] = useState(false);
  const handleOpenInterview = () => {
    setOpenInterview(prev => !prev);
  };
  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="INTERVIEW"
      koTitle={title}
      titleClassName={titleClassName}
      {...rest}
    >
      <section className="relative flex flex-col gap-6 items-center justify-center">
        {preview && (
          <div className="w-83.75 h-30 overflow-hidden rounded-3xl">
            <Image
              src={preview}
              alt="인터뷰 이미지"
              fill
              className="object-cover"
            />
          </div>
        )}
        {openInterview && (
          <div className="flex flex-col gap-6">
            {(questions || []).map((question, index) => (
              <section
                key={`${question.questionId}-${index}`}
                className="flex flex-col gap-6"
              >
                <p className="text-sm text-center select-none">
                  {question.question}
                </p>
                <div
                  className="text-sm text-center select-none"
                  dangerouslySetInnerHTML={{
                    __html: question.answer.messageHtml || '',
                  }}
                />
              </section>
            ))}
          </div>
        )}
        <Button variant="bordered" size="md" onClick={handleOpenInterview}>
          {!openInterview ? '인터뷰 읽어보기' : '닫기'}
        </Button>
      </section>
    </MiddlePreviewWrapper>
  );
};
