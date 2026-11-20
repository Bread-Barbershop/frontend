import { Image } from '@/components/atoms/image';
import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { cn } from '@/shared/utils/cn';

import type { StaticImageData } from 'next/image';

export const InterviewPreviewItem = ({
  question,
  answerHtml,
  image,
  defaultImage,
  isOpen,
  className,
  onToggle,
}: {
  question: string;
  answerHtml: string;
  image?: (File | string)[];
  defaultImage?: StaticImageData;
  isOpen: boolean;
  className?: string;
  onToggle: () => void;
}) => {
  const customPreview = useResolvedImageSource(image?.[0]);
  const preview = customPreview ?? defaultImage;
  const { fontFamily } = useBodyFontInfo();

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
      {question && (
        <p
          className="text-sm text-center font-semibold select-text"
          style={{ fontFamily }}
        >
          {question}
        </p>
      )}
      {answerHtml && (
        <>
          <div
            aria-hidden={!isOpen}
            className={cn(
              'accordion-motion w-full',
              isOpen ? 'accordion-motion-open' : 'accordion-motion-close'
            )}
          >
            <div className="w-full overflow-hidden">
              <PreviewBody html={answerHtml} />
            </div>
          </div>
          <button
            type="button"
            aria-expanded={isOpen}
            className="flex justify-center items-center py-2 px-10 rounded-lg border border-[#e5e5e8] bg-[#FFFFFF] hover:bg-gray-50 hover:border-gray-300 cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
            draggable={false}
            onDragStart={event => event.preventDefault()}
            onClick={onToggle}
          >
            <p className="text-sm font-bold text-text-secondary select-none">
              {isOpen ? '인터뷰 닫기' : '인터뷰 더 읽어보기'}
            </p>
          </button>
        </>
      )}
    </div>
  );
};
