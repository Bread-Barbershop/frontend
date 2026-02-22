import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState } from 'react';

import { cn } from '@/shared/utils/cn';

import {
  imageVariants,
  imageWrapperVariants,
  skeletonVariants,
} from './Image.style';

interface ImageProps extends Omit<NextImageProps, 'onLoad'> {
  skeletonClassName?: string;
}

export const Image = ({
  src,
  alt,
  className,
  skeletonClassName,
  ...rest
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // blob: URL인 경우 서버 최적화가 불가능하므로 unoptimized 속성 자동 적용
  const isBlob = typeof src === 'string' && src.startsWith('blob:');

  // fill 속성 사용 시 기본 sizes 설정 (브라우저가 적절한 크기의 이미지를 요청하도록 유도)
  const defaultSizes = rest.fill
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : undefined;

  return (
    <div className={cn(imageWrapperVariants({ fill: rest.fill }))}>
      {isLoading && (
        <div className={cn(skeletonVariants(), skeletonClassName)} />
      )}
      <NextImage
        src={src}
        alt={alt ?? '이미지 미리보기'}
        unoptimized={rest.unoptimized || isBlob}
        sizes={rest.sizes || defaultSizes}
        {...rest}
        className={cn(className, imageVariants({ loading: isLoading }))}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
