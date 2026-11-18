'use client';

import GuestCollection from '@/features/invitation/collection/GuestCollection';
import InviaLogo from '@/shared/assets/logo/invia-logo.svg';
import { DriveImageResolveModeProvider } from '@/shared/hooks/useDriveImageResolveMode';

import GuestBgm from './GuestBgm';
import { GuestMainPoster } from './GuestMainPoster';
import { GuestPrivacyNotice } from './GuestPrivacyNotice';
import GuestRenderer from './GuestRenderer';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

type GuestInvitationViewMode = 'guest' | 'dashboard-preview';

type GuestInvitationViewProps = {
  collectionId?: string;
  onMainPosterReady?: () => void;
  payload: NormalizedGuestPayload;
  mode?: GuestInvitationViewMode;
  previewFolderId?: string;
  localAudioSrc?: string | null;
};

function GuestInvitationView({
  collectionId,
  onMainPosterReady,
  payload,
  mode = 'guest',
  previewFolderId,
  localAudioSrc,
}: GuestInvitationViewProps) {
  const Root = mode === 'guest' ? 'main' : 'div';
  const rootClassName =
    mode === 'guest'
      ? 'min-h-screen bg-neutral-50'
      : 'min-h-full bg-neutral-50';
  const imageResolveMode =
    mode === 'dashboard-preview' ? 'dashboard-preview' : 'public';
  const containerClassName =
    mode === 'guest'
      ? 'relative mx-auto w-full min-w-[375px] max-w-[430px] bg-white shadow-sm'
      : 'relative mx-auto w-full max-w-[430px] bg-white shadow-sm';

  return (
    <DriveImageResolveModeProvider
      folderId={previewFolderId}
      mode={imageResolveMode}
    >
      <Root className={rootClassName}>
        <div
          id="preview-container"
          className={containerClassName}
          style={{
            backgroundColor: payload.bulkData.backgroundColor,
          }}
        >
          <div className="sticky top-0 z-50 h-0">
            <GuestBgm
              bgm={payload.bgm}
              mode={mode}
              previewFolderId={previewFolderId}
              localAudioSrc={localAudioSrc}
            />
          </div>
          {payload.activePrivacyFields?.includes('poster') ? (
            <GuestPrivacyNotice kind="poster" />
          ) : (
            <GuestMainPoster
              onReady={onMainPosterReady}
              thumbnailFileId={payload.mainPoster.thumbnailFileId ?? ''}
            />
          )}
          <div className="mx-auto w-full">
            <GuestRenderer
              blocks={payload.blocks}
              bulkData={payload.bulkData}
              renderHints={payload.renderHints}
              activePrivacyFields={payload.activePrivacyFields}
              isGuestPage
            />
          </div>
          {collectionId && mode === 'guest' && <GuestCollection id={collectionId} />}
          <GuestInvitationFooter />
        </div>
      </Root>
    </DriveImageResolveModeProvider>
  );
}

function GuestInvitationFooter() {
  return (
    <footer
      className="flex h-[76px] w-full select-none items-center justify-center bg-inherit"
      aria-label="Special moments with INVIA"
    >
      <a
        href="https://invia.co.kr"
        className="flex items-end gap-[5px]"
        aria-label="INVIA 홈페이지로 이동"
      >
        <span className="font-['NanumSquare'] text-[11px] font-bold leading-[11px] text-[#4E4E4E]">
          Special moments with
        </span>
        <InviaLogo
          className="h-[12px] w-auto shrink-0"
          focusable="false"
          aria-hidden="true"
        />
      </a>
    </footer>
  );
}

export default GuestInvitationView;
