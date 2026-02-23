import { cn } from '@/shared/utils/cn';

import { Image } from '../image';

import { picturePreviewVariants } from './PicturePreview.style';

interface Props {
  src: string;
  alt?: string;
  className?: string;
  onDelete: (src: string) => void;
}

export const PicturePreview = ({ src, alt, className, onDelete }: Props) => {
  return (
    <div className={cn(picturePreviewVariants(), className)}>
      <button
        type="button"
        className="absolute top-0 right-0 z-100 flex-center rounded-full bg-black/50 w-6 h-6"
        aria-label="이미지 삭제"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.preventDefault();
          onDelete(src);
        }}
      >
        <svg
          width="7"
          height="7"
          viewBox="0 0 7 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>이미지 삭제</title>
          <path
            d="M6 1L1 6M1 1L6 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <Image
        src={src}
        alt={alt ?? '이미지 미리보기'}
        fill
        className="object-cover"
      />
    </div>
  );
};
