import Cancel from '@/shared/assets/icons/cancel.svg';
import { cn } from '@/shared/utils/cn';

import { Image } from '../image';

import { picturePreviewVariants } from './PicturePreview.style';

interface Props {
  src: string;
  alt?: string;
  className?: string;
  onDelete: (src: string) => void;
  onCrop?: () => void;
}

export const PicturePreview = ({
  src,
  alt,
  className,
  onDelete,
  onCrop,
}: Props) => {
  return (
    <div className={cn(picturePreviewVariants(), className)}>
      <button
        type="button"
        className="absolute top-0 right-0 z-1 flex-center rounded-full bg-black/50 w-6 h-6"
        aria-label="이미지 삭제"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.preventDefault();
          onDelete(src);
        }}
      >
        <Cancel className="w-[7px] h-[7px] text-white" />
      </button>
      <Image
        src={src}
        alt={alt ?? '이미지 미리보기'}
        fill
        className="object-cover"
      />
      {onCrop && (
        <button
          type="button"
          className="absolute inset-x-0 bottom-0 z-1 bg-black/70 py-0.5 text-xs font-medium text-white"
          onPointerDown={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            onCrop();
          }}
        >
          자르기
        </button>
      )}
    </div>
  );
};
