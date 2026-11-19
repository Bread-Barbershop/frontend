'use client';

import { useEffect, useSyncExternalStore } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import type { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import type { ShowcaseInvitation } from '@/shared/data/showcaseInvitations';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';

type Props = ReturnType<typeof buildShowcaseInvitation> & {
  design: ShowcaseInvitation;
};

// The iframe is narrow on desktop too. Use the preview dialog's breakpoint.
function getMobilePreviewQuery() {
  if (
    typeof window === 'undefined' ||
    !window.frameElement?.hasAttribute('data-showcase-preview')
  ) {
    return null;
  }

  return window.parent.matchMedia('(width < 800px)');
}

function subscribeToMobilePreview(callback: () => void) {
  const query = getMobilePreviewQuery();
  query?.addEventListener('change', callback);
  return () => query?.removeEventListener('change', callback);
}

export default function ShowcaseDocument({ design, blocks, bulkData }: Props) {
  const template = INVITATION_TEMPLATES.find(item => item.id === design.id)!;
  const fitPosterToFrame = useSyncExternalStore(
    subscribeToMobilePreview,
    () => getMobilePreviewQuery()?.matches ?? false,
    () => false
  );
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        event.preventDefault();
        return;
      }
      if (window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage(
          { type: 'invia:close-showcase' },
          window.location.origin
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <article
      aria-label={`${design.name} 초대장`}
      style={{ backgroundColor: template.colors.background }}
    >
      <header className={fitPosterToFrame ? 'h-screen' : undefined}>
        <h1 className="sr-only">{design.name}</h1>
        <InvitationTemplatePoster
          template={template}
          fit={fitPosterToFrame ? 'contain' : 'cover'}
        />
      </header>
      <GuestRenderer blocks={blocks} bulkData={bulkData} isGuestPage />
      <footer className="px-6 pb-10 text-center text-[10px] text-black/45">
        디자인 예시 · 이름, 일정, 장소는 자유롭게 바꿀 수 있어요.
      </footer>
    </article>
  );
}
