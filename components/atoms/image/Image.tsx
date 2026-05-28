import NextImage, { ImageProps as NextImageProps } from 'next/image';
import React, { useCallback, useRef, useState } from 'react';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { cn } from '@/shared/utils/cn';

import { imageVariants, imageWrapperVariants } from './Image.style';

interface ImageProps extends Omit<NextImageProps, 'onLoad' | 'alt'> {
  alt?: string;
  loadingClassName?: string;
  draggable?: boolean;
  onLoad?: () => void;
}

export const Image = ({
  src,
  alt = '이미지 미리보기',
  className,
  loadingClassName,
  draggable = false,
  onLoad,
  ...rest
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [prevSrc, setPrevSrc] = useState(src);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (prevSrc !== src) {
    setIsLoading(true);
    setPrevSrc(src);
  }

  // blob: URL인 경우 서버 최적화가 불가능하므로 unoptimized 속성 자동 적용
  const isBlob = typeof src === 'string' && src.startsWith('blob:');

  // Google Drive 또는 Google User Content URL인 경우 리다이렉트 이슈 방지를 위해 unoptimized 속성 자동 적용
  const isGoogleDrive =
    typeof src === 'string' &&
    (src.includes('drive.google.com') || src.includes('googleusercontent.com'));

  // fill 속성 사용 시 기본 sizes 설정 (브라우저가 적절한 크기의 이미지를 요청하도록 유도)
  const defaultSizes = rest.fill
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : undefined;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable) return;
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [draggable]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable) return;
      if (!isDragging.current || !containerRef.current) return;

      const container = containerRef.current;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      // 컨테이너 크기 대비 이동 비율 계산
      // 감도 조절: 숫자가 클수록 적게 움직임
      const sensitivity = 1.5;
      const deltaXPercent = (dx / container.offsetWidth) * 100 * sensitivity;
      const deltaYPercent = (dy / container.offsetHeight) * 100 * sensitivity;

      setPosition(prev => ({
        // 드래그 방향과 이미지 이동 방향을 맞추려면 빼기
        x: Math.max(0, Math.min(100, prev.x - deltaXPercent)),
        y: Math.max(0, Math.min(100, prev.y - deltaYPercent)),
      }));
    },
    [draggable]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  return (
    <div className={cn(imageWrapperVariants({ fill: rest.fill }))}>
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            loadingClassName
          )}
        >
          <LoadingSpinner className="w-5 h-5 animate-spin" />
        </div>
      )}
      {draggable && (
        <div
          ref={containerRef}
          className="w-full h-full relative overflow-hidden cursor-grab"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="이미지 드래그하여 영역을 변경할 수 있어요"
        >
          <NextImage
            {...rest}
            src={src}
            alt={alt}
            unoptimized={rest.unoptimized || isBlob || isGoogleDrive}
            sizes={rest.sizes || defaultSizes}
            className={cn(className, imageVariants({ loading: isLoading }))}
            onLoad={() => {
              setIsLoading(false);
              onLoad?.();
            }}
            onError={() => setIsLoading(false)}
            draggable={false}
            style={{
              objectFit: 'cover',
              objectPosition: `${position.x}% ${position.y}%`,
              pointerEvents: 'none', // 이미지 자체 드래그 방지
              userSelect: 'none',
            }}
          />
        </div>
      )}
      {!draggable && (
        <NextImage
          {...rest}
          src={src}
          alt={alt}
          unoptimized={rest.unoptimized || isBlob || isGoogleDrive}
          sizes={rest.sizes || defaultSizes}
          className={cn(className, imageVariants({ loading: isLoading }))}
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};
