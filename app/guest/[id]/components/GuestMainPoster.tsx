'use client';

import '@/widgets/mainPoster/libs/customImage-filter';

import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

export const GuestMainPoster = ({
  thumbnailFileId,
}: {
  thumbnailFileId: string;
}) => {
  const resolvedSrc = useResolvedImageSource(thumbnailFileId);

  if (resolvedSrc) {
    return (
      <div className="w-full relative aspect-[375/812] overflow-hidden">
        {/* 메인 포스터는 첫 화면 핵심 이미지라 Google 직접 URL을 유지하면서 우선순위만 높인다. */}
        <Image
          src={resolvedSrc}
          alt="초대장 메인 포스터"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 430px) 100vw, 430px"
          unoptimized
          className="object-cover"
          onLoad={() => {
            window.dispatchEvent(new Event('guest-main-poster-ready'));
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
