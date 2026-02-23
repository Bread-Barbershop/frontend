import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState } from 'react';

import { cn } from '@/shared/utils/cn';

import { imageVariants, imageWrapperVariants } from './Image.style';

interface ImageProps extends Omit<NextImageProps, 'onLoad' | 'alt'> {
  alt?: string;
  loadingClassName?: string;
}

export const Image = ({
  src,
  alt = '이미지 미리보기',
  className,
  loadingClassName,
  ...rest
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setIsLoading(true);
    setPrevSrc(src);
  }

  // blob: URL인 경우 서버 최적화가 불가능하므로 unoptimized 속성 자동 적용
  const isBlob = typeof src === 'string' && src.startsWith('blob:');

  // fill 속성 사용 시 기본 sizes 설정 (브라우저가 적절한 크기의 이미지를 요청하도록 유도)
  const defaultSizes = rest.fill
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : undefined;

  return (
    <div className={cn(imageWrapperVariants({ fill: rest.fill }))}>
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            loadingClassName
          )}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin text-gray-400"
          >
            <title>로딩 스피너</title>
            <path
              d="M11 1V5M11 17V21M3.93 3.93L6.76 6.76M15.24 15.24L18.07 18.07M1 11H5M17 11H21M3.93 18.07L6.76 15.24M15.24 6.76L18.07 3.93"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <NextImage
        {...rest}
        src={src}
        alt={alt}
        unoptimized={rest.unoptimized || isBlob}
        sizes={rest.sizes || defaultSizes}
        className={cn(className, imageVariants({ loading: isLoading }))}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
};
