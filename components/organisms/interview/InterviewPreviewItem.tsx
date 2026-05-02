import { Image } from '@/components/atoms/image';
import interviewFallbackImage from '@/shared/assets/images/fallback/interview-fallback.png';
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
  const imageSrc = preview || interviewFallbackImage;

  return (
    <div className="w-65 flex flex-col gap-4 overflow-hidden">
      <div className="relative h-25 overflow-hidden rounded-3xl">
        <Image
          src={imageSrc}
          alt="인터뷰 이미지"
          fill
          sizes="260px"
          className="object-cover"
        />
      </div>
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
