'use client';

import '@/widgets/mainPoster/libs/customImage-filter';
import { useRef } from 'react';

import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
// import { PerformanceTimer } from '@/shared/utils/performance';

export const GuestMainPoster = ({
  thumbnailFileId,
}: {
  thumbnailFileId: string;
}) => {
  const resolvedSrc = useResolvedImageSource(thumbnailFileId);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const timerRef = useRef<PerformanceTimer | null>(null);

  // eslint-disable-next-line react-hooks/refs
  // if (!timerRef.current && resolvedSrc) {
  //   timerRef.current = new PerformanceTimer('GuestMainPoster Image Load');
  // }

  if (resolvedSrc) {
    return (
      <div className="w-full relative aspect-[375/812] overflow-hidden">
        <Image
          src={resolvedSrc}
          alt="초대장 메인 포스터"
          fill
          unoptimized
          className="object-cover"
          onLoad={() => {
            // timerRef.current?.end();
            window.dispatchEvent(new Event('guest-main-poster-ready'));
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-red-100 min-h-[300px] flex flex-col items-center justify-center text-red-500"
    >
      <p>⚠️ 이미지를 불러오지 못했습니다.</p>
      <p className="text-xs mt-2">
        thumbnailFileId:{' '}
        {thumbnailFileId
          ? thumbnailFileId
          : '없음 (저장 버튼을 다시 눌러주세요)'}
      </p>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
