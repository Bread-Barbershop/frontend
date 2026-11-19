'use client';

import { InvitationBackgroundTexture } from '@/components/molecules/invitation-background-texture/InvitationBackgroundTexture';
import { AmbientParticles } from '@/components/organisms/visualEffects/ParticleLayer';
import InviaLogo from '@/shared/assets/logo/invia-logo.svg';
import { DriveImageResolveModeProvider } from '@/shared/hooks/useDriveImageResolveMode';
import { cn } from '@/shared/utils/cn';
import { isDarkInvitationBackground } from '@/shared/utils/invitationBackgroundColor';
import { resolveInvitationEffects } from '@/shared/utils/invitationEffects';

import GuestBgm from './GuestBgm';
import { GuestMainPoster } from './GuestMainPoster';
import { GuestPrivacyNotice } from './GuestPrivacyNotice';
import GuestRenderer from './GuestRenderer';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

type GuestInvitationViewMode = 'guest' | 'dashboard-preview';

type GuestInvitationViewProps = {
  onMainPosterReady?: () => void;
  payload: NormalizedGuestPayload;
  mode?: GuestInvitationViewMode;
  previewFolderId?: string;
  localAudioSrc?: string | null;
  showScreenEffects?: boolean;
  fitPosterToViewport?: boolean;
};

function GuestInvitationView({
  onMainPosterReady,
  payload,
  mode = 'guest',
  previewFolderId,
  localAudioSrc,
  showScreenEffects,
  fitPosterToViewport,
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
      ? 'relative isolate mx-auto w-full min-w-[375px] max-w-[430px] shadow-sm'
      : 'relative isolate mx-auto w-full max-w-[430px] shadow-sm';

  return (
    <DriveImageResolveModeProvider
      folderId={previewFolderId}
      mode={imageResolveMode}
    >
      <Root className={rootClassName}>
        <div id="preview-container" className={containerClassName}>
          <InvitationBackgroundTexture
            color={payload.bulkData.backgroundColor}
            texture={payload.bulkData.backgroundTexture}
          />
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
            <div className="relative">
              <GuestMainPoster
                onReady={onMainPosterReady}
                thumbnailFileId={payload.mainPoster.thumbnailFileId ?? ''}
                fitToViewport={fitPosterToViewport}
              />
              <AmbientParticles
                effects={resolveInvitationEffects(payload.bulkData.invitationEffects, payload.blocks)}
                placement="poster"
              />
            </div>
          )}
          <div className="mx-auto w-full">
            <GuestRenderer
              blocks={payload.blocks}
              bulkData={payload.bulkData}
              renderHints={payload.renderHints}
              activePrivacyFields={payload.activePrivacyFields}
              {...(showScreenEffects === false && { showVisualEffects: false })}
              isGuestPage
            />
          </div>
          <GuestInvitationFooter
            darkBackground={isDarkInvitationBackground(
              payload.bulkData.backgroundColor
            )}
          />
        </div>
      </Root>
    </DriveImageResolveModeProvider>
  );
}

function GuestInvitationFooter({ darkBackground }: { darkBackground: boolean }) {
  return (
    <footer
      className="flex h-[76px] w-full select-none items-center justify-center"
      aria-label="Special moments with INVIA"
    >
      <a
        href="https://invia.co.kr"
        className={cn(
          'flex items-end gap-[5px]',
          darkBackground && 'text-white'
        )}
        aria-label="INVIA 홈페이지로 이동"
      >
        <span
          className={cn(
            "font-['NanumSquare'] text-[11px] font-bold leading-[11px]",
            !darkBackground && 'text-[#4E4E4E]'
          )}
        >
          Special moments with
        </span>
        <InviaLogo
          className={cn(
            'h-[12px] w-auto shrink-0',
            darkBackground && '[&_path]:fill-current'
          )}
          focusable="false"
          aria-hidden="true"
        />
      </a>
    </footer>
  );
}

export default GuestInvitationView;
