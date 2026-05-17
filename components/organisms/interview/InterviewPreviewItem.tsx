import { Image } from '@/components/atoms/image';
import { previewTextClassName } from '@/components/molecules/text-editor/utils/previewTextClassName';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { cn } from '@/shared/utils/cn';

export const InterviewPreviewItem = ({
  question,
  answerHtml,
  image,
  isOpen,
  className,
  onToggle,
}: {
  question: string;
  answerHtml: string;
  image?: (File | string)[];
  isOpen: boolean;
  className?: string;
  onToggle: () => void;
}) => {
  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );
  const hasAnswer =
    answerHtml
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, '')
      .trim().length > 0;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-6 overflow-hidden select-none [-webkit-tap-highlight-color:transparent]',
        className
      )}
    >
      {preview && (
        <div
          className="relative h-25 w-full overflow-hidden rounded-3xl select-none"
          draggable={false}
          onDragStart={event => event.preventDefault()}
        >
          <Image
            src={preview}
            alt="인터뷰 이미지"
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
      )}
      <p className="text-sm text-center font-semibold select-text">
        {question}
      </p>
      <div
        className={cn(
          'accordion-motion w-full',
          isOpen ? 'accordion-motion-open' : 'accordion-motion-close'
        )}
      >
        <div key="interview-answer" className="w-full overflow-hidden">
          {hasAnswer ? (
            <div
              className={`text-sm text-center select-text ${previewTextClassName}`}
              dangerouslySetInnerHTML={{ __html: answerHtml }}
            />
          ) : (
            <p className="text-sm text-center text-text-secondary select-text ">
              인터뷰 내용이 비어있습니다.
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        className="flex justify-center items-center py-2 px-10 rounded-lg border border-[#e5e5e8] hover:bg-gray-50 hover:border-gray-300 cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
        draggable={false}
        onDragStart={event => event.preventDefault()}
        onClick={onToggle}
      >
        <p className="text-sm font-bold text-text-secondary select-none">
          {isOpen ? '인터뷰 닫기' : '인터뷰 더 읽어보기'}
        </p>
      </button>
    </div>
  );
};
