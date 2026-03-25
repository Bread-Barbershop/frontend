import { Image } from '@/components/atoms/image';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';

import type { HTMLAttributes } from 'react';

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
  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="INTERVIEW"
      koTitle={title}
      titleClassName={titleClassName}
      {...rest}
    >
      <div className="flex flex-col gap-4">
        <div className="w-83.75 h-30 overflow-hidden rounded-3xl">
          {preview && (
            <Image
              src={preview}
              alt="인터뷰 이미지"
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          {(questions || []).map((question, index) => (
            <div
              key={`${question.id}-${index}`}
              className="text-sm text-center select-none"
              dangerouslySetInnerHTML={{ __html: question.messageHtml || '' }}
            />
          ))}
        </div>
      </div>
    </MiddlePreviewWrapper>
  );
};
