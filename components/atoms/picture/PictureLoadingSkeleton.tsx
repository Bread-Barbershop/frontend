import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { cn } from '@/shared/utils/cn';

import { picturePreviewVariants } from './PicturePreview.style';

interface Props {
  className?: string;
}

/** 이미지 압축 처리 중 미리보기 자리에 보여주는 스켈레톤 + 스피너 */
export const PictureLoadingSkeleton = ({ className }: Props) => {
  return (
    <div
      className={cn(
        picturePreviewVariants(),
        'animate-pulse cursor-default',
        className
      )}
      aria-label="이미지 처리 중"
    >
      <LoadingSpinner className="w-5 h-5 animate-spin " />
    </div>
  );
};
