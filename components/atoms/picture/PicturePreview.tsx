import Image from 'next/image';

import { cn } from '@/shared/utils/cn';

import { pictureVariants } from './PicturePreview.style';

interface Props {
  src: string;
  alt?: string;
  className?: string;
}

export const PicturePreview = ({ src, alt, className }: Props) => {
  console.log('src', src);
  return (
    <div
      className={cn(pictureVariants({ className }), 'relative overflow-hidden')}
    >
      <Image
        src={src}
        alt={alt ?? '이미지 미리보기'}
        fill
        className="object-cover"
      />
    </div>
  );
};
