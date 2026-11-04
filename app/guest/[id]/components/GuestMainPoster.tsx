'use client';

import '@/widgets/mainPoster/libs/customImage-filter';

import { useEffect } from 'react';

import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

export const GuestMainPoster = ({
  onReady,
  thumbnailFileId,
}: {
  onReady?: () => void;
  thumbnailFileId: string;
}) => {
  const resolvedSrc = useResolvedImageSource(thumbnailFileId);

  useEffect(() => {
    // 대표 이미지가 없는 초대장도 미리보기에서는 준비 완료로 보고 fallback 화면을 보여준다.
    if (resolvedSrc) return;
    onReady?.();
  }, [onReady, resolvedSrc]);

  if (resolvedSrc) {
    return (
      <div className="w-full relative aspect-[375/812] overflow-hidden">
        {/* 공개 페이지의 preload와 중복되지 않도록 이미지 자체는 eager/high로 요청한다. */}
        <Image
          src={resolvedSrc}
          alt="초대장 메인 포스터"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 430px) 100vw, 430px"
          unoptimized
          className="object-cover"
          onLoad={() => {
            // 기존 BGM 노출 타이밍은 전역 이벤트로 유지하고, 미리보기 모달에는 콜백으로 알려준다.
            window.dispatchEvent(new Event('guest-main-poster-ready'));
            onReady?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-[375/812] w-full flex-col items-center justify-center bg-[#F7F4EF] px-8 text-center font-pretendard text-[#6B6258]">
      <p className="text-[15px] font-semibold leading-[140%]">
        초대장 이미지를 준비하고 있어요.
      </p>
      <p className="mt-2 text-[13px] font-medium leading-[140%] text-[#8B8176]">
        잠시 후 다시 열어주세요.
      </p>
    </div>
  );
};
