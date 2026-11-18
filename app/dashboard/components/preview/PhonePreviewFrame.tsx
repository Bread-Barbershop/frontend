'use client';

import Image from 'next/image';
import { useRef } from 'react';

import GuestInvitationView from '@/app/guest/[id]/components/GuestInvitationView';
import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import { InvitationVisualEffects } from '@/components/organisms/visualEffects/VisualEffectsPreview';
import PhoneFrameImage from '@/shared/assets/images/dashboard/invitation-preview-frame.png';
import { resolveInvitationEffects } from '@/shared/utils/invitationEffects';

import type { CSSProperties, ReactNode } from 'react';

const FRAME_WIDTH = 433;
const FRAME_HEIGHT = 872;
const FRAME_SCREEN_TOP = 24;
const FRAME_CAMERA_CLEARANCE = 80;
const FRAME_DISPLAY_WIDTH = `min(${FRAME_WIDTH}px, calc(100vw - 48px), calc((100vh - 48px) * ${FRAME_WIDTH} / ${FRAME_HEIGHT}))`;
// 프레임 이미지가 축소되면 카메라 영역도 같은 비율로 줄어든다.
const FRAME_BGM_TOP = `max(2rem, calc(${FRAME_DISPLAY_WIDTH} * ${FRAME_CAMERA_CLEARANCE} / ${FRAME_WIDTH} - ${FRAME_SCREEN_TOP}px))`;

const frameScreenStyle: CSSProperties & {
  '--phone-frame-bgm-top': string;
  '--phone-frame-bgm-right': string;
} = {
  // PNG 프레임의 실제 화면 구멍에 맞춘 값이다. 프레임 원본 크기는 유지한다.
  inset: `${FRAME_SCREEN_TOP}px 27px 31px`,
  borderRadius: '48px',
  '--phone-frame-bgm-top': FRAME_BGM_TOP,
  '--phone-frame-bgm-right': 'min(2rem, 9%)',
};

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
  const screenContentRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="relative shrink-0"
      style={{
        aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}`,
        width: FRAME_DISPLAY_WIDTH,
      }}
    >
      <div
        className="phone-preview-frame absolute isolate overflow-hidden bg-white"
        style={frameScreenStyle}
      >
        <div
          ref={screenContentRef}
          className="h-full w-full overflow-y-auto rounded-[48px] bg-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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
                showVisualEffects={false}
              />
            </div>
          )}
          {/* 대표 이미지가 준비되기 전에는 초대장을 뒤에서 렌더하되 로딩 UI를 위에 유지한다. */}
          {(!payload || !isPosterReady) && (
            <div className="absolute inset-0 bg-white">{children}</div>
          )}
        </div>
        {payload && isPosterReady && (
          <InvitationVisualEffects
            effects={resolveInvitationEffects(
              payload.bulkData.invitationEffects,
              payload.blocks
            )}
            backgroundColor={payload.bulkData.backgroundColor}
            contentRef={screenContentRef}
            scope="frame"
          />
        )}
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
