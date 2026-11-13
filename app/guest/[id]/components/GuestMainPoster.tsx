'use client';

import '@/widgets/mainPoster/libs/customImage-filter';

import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

export const GuestMainPoster = ({
  thumbnailFileId,
  onReady,
}: {
  onReady?: () => void;
  thumbnailFileId: string;
}) => {
  const resolvedSrc = useResolvedImageSource(thumbnailFileId);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!resolvedSrc) {
      // 대표 이미지가 없는 초대장도 본문을 볼 수 있도록 안내 화면을 표시한다.
      onReadyRef.current?.();
    }
  }, [resolvedSrc]);

  if (!resolvedSrc) return <PosterFallback />;

  return (
    <GuestMainPosterImage
      key={resolvedSrc}
      src={resolvedSrc}
      onReadyRef={onReadyRef}
    />
  );
};

function GuestMainPosterImage({
  src,
  onReadyRef,
}: {
  src: string;
  onReadyRef: MutableRefObject<(() => void) | undefined>;
}) {
  const slowTimerRef = useRef<number | null>(null);
  const imageSettledRef = useRef(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageIsSlow, setImageIsSlow] = useState(false);

  useEffect(() => {
    if (imageSettledRef.current) return;

    // 이미지가 계속 대기 중이면 본문과 재시도 UI를 보이고, 이미지는 계속 유지한다.
    slowTimerRef.current = window.setTimeout(() => {
      slowTimerRef.current = null;
      setImageIsSlow(true);
      onReadyRef.current?.();
    }, 10_000);

    return () => {
      if (slowTimerRef.current !== null) {
        window.clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
    };
  }, [onReadyRef]);

  const clearSlowTimer = () => {
    if (slowTimerRef.current !== null) {
      window.clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
  };

  const handleImageLoad = () => {
    imageSettledRef.current = true;
    clearSlowTimer();
    setImageIsSlow(false);
    window.dispatchEvent(new Event('guest-main-poster-ready'));
    onReadyRef.current?.();
  };

  const handleImageError = () => {
    imageSettledRef.current = true;
    clearSlowTimer();
    setImageFailed(true);
    setImageIsSlow(false);
    onReadyRef.current?.();
  };

  if (imageFailed) return <PosterFallback imageFailed />;

  return (
    <div className="w-full relative overflow-hidden flex justify-center">
      {/* 공개 페이지의 preload와 중복되지 않도록 이미지 자체는 eager/high로 요청한다. */}
      <Image
        src={src}
        alt="초대장 메인 포스터"
        width={375}
        height={812}
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 430px) 100vw, 430px"
        unoptimized
        wrapperClassName="w-full flex justify-center"
        className="w-full h-auto"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {imageIsSlow && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center px-5"
        >
          <div className="max-w-[300px] rounded-xl bg-white/95 px-4 py-3 text-center shadow-lg">
            <p className="font-pretendard text-[13px] font-medium leading-[140%] text-[#4B5563]">
              대표 이미지를 불러오는 중이에요. 아래 내용은 계속 볼 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 rounded-lg bg-black px-4 py-2 font-pretendard text-[13px] font-semibold text-white"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PosterFallback({ imageFailed = false }: { imageFailed?: boolean }) {
  return (
    <div className="flex aspect-[375/812] w-full flex-col items-center justify-center bg-[#F7F4EF] px-8 text-center font-pretendard text-[#6B6258]">
      <p className="text-[15px] font-semibold leading-[140%]">
        {imageFailed
          ? '초대장 이미지를 불러오지 못했어요.'
          : '초대장 이미지를 준비하고 있어요.'}
      </p>
      <p className="mt-2 text-[13px] font-medium leading-[140%] text-[#8B8176]">
        이미지 문제와 관계없이 아래 초대장 내용은 계속 볼 수 있어요.
      </p>
      {imageFailed && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-[13px] font-semibold text-white"
        >
          다시 시도하기
        </button>
      )}
    </div>
  );
}
