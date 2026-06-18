'use client';

import Image from 'next/image';

import GuestInvitationView from '@/app/guest/[id]/components/GuestInvitationView';
import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import PhoneFrameImage from '@/shared/assets/images/dashboard/invitation-preview-frame.png';

import type { ReactNode } from 'react';

const FRAME_WIDTH = 433;
const FRAME_HEIGHT = 872;

type PhonePreviewFrameProps = {
  children?: ReactNode;
  folderId: string;
  isPosterReady?: boolean;
  onMainPosterReady?: () => void;
  payload?: NormalizedGuestPayload | null;
};

function PhonePreviewFrame({
  children,
  folderId,
  isPosterReady = false,
  onMainPosterReady,
  payload,
}: PhonePreviewFrameProps) {
  return (
    <div
      className="relative shrink-0"
      style={{
        aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}`,
        width: `min(${FRAME_WIDTH}px, calc(100vw - 48px), calc((100vh - 48px) * ${FRAME_WIDTH} / ${FRAME_HEIGHT}))`,
      }}
    >
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          // PNG 프레임의 실제 화면 구멍에 맞춘 값이다. 프레임 원본 크기는 유지한다.
          inset: '24px 27px 31px',
          borderRadius: '48px',
        }}
      >
        <div className="h-full w-full overflow-y-auto rounded-[48px] bg-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {payload && (
            <div
              className={`transition-opacity duration-200 ${
                isPosterReady ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <GuestInvitationView
                onMainPosterReady={onMainPosterReady}
                payload={payload}
                mode="dashboard-preview"
                previewFolderId={folderId}
              />
            </div>
          )}
          {/* 대표 이미지가 준비되기 전에는 초대장을 뒤에서 렌더하되 로딩 UI를 위에 유지한다. */}
          {(!payload || !isPosterReady) && (
            <div className="absolute inset-0 bg-white">{children}</div>
          )}
        </div>
      </div>
      <Image
        src={PhoneFrameImage}
        alt=""
        fill
        priority
        sizes="433px"
        className="pointer-events-none select-none"
      />
    </div>
  );
}

export default PhonePreviewFrame;
