import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

export const InterviewPreviewItem = ({
  question,
  answerHtml,
  image,
}: {
  question: string;
  answerHtml: string;
  image?: (File | string)[];
}) => {
  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );

  return (
    <div className="w-65 flex flex-col gap-4 overflow-hidden">
      {!preview && (
        <div className="h-25 overflow-hidden rounded-3xl flex flex-col justify-center items-center bg-border-neutral">
          <p className="text-sm text-center select-none">
            사진을 추가해 주세요.
          </p>
        </div>
      )}
      {preview && (
        <div className="h-25 overflow-hidden rounded-3xl">
          <Image
            src={preview}
            alt="인터뷰 이미지"
            width={260}
            height={100}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-4">
        <p className="text-sm text-center font-semibold select-none">
          {question}
        </p>
        <div
          className="text-sm text-center select-none"
          dangerouslySetInnerHTML={{ __html: answerHtml }}
        />
      </div>
    </div>
  );
};
