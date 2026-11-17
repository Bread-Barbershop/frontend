'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import GuestInvitationView from '@/app/guest/[id]/components/GuestInvitationView';
import {
  parsePreviewSnapshot,
  PREVIEW_MESSAGE,
  type PreviewSnapshot,
} from '@/features/invitation/preview/previewSnapshot';

export default function DraftInvitationDocument() {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);

  useEffect(() => {
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== PREVIEW_MESSAGE.snapshot
      )
        return;
      const next = parsePreviewSnapshot(event.data.snapshot);
      if (next) setSnapshot(next);
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault();
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        return;
      }
      window.parent.postMessage(
        { type: PREVIEW_MESSAGE.close },
        window.location.origin
      );
    };
    window.addEventListener('message', receive);
    window.addEventListener('keydown', keyDown);
    window.parent.postMessage(
      { type: PREVIEW_MESSAGE.ready },
      window.location.origin
    );
    return () => {
      window.removeEventListener('message', receive);
      window.removeEventListener('keydown', keyDown);
    };
  }, []);

  useEffect(() => {
    if (snapshot)
      window.parent.postMessage(
        { type: PREVIEW_MESSAGE.rendered },
        window.location.origin
      );
  }, [snapshot]);

  return (
    <div data-clarity-mask="true">
      {snapshot ? (
        <GuestInvitationView
          payload={snapshot.payload}
          mode="dashboard-preview"
          previewFolderId={snapshot.previewFolderId}
          localAudioSrc={snapshot.localAudioSrc}
        />
      ) : (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#F5F4F0] px-6 text-center text-sm text-text-secondary">
          <p>편집 화면에서 미리보기를 열어주세요.</p>
          <Link
            href="/editor"
            target="_top"
            className="underline underline-offset-4"
          >
            편집 화면으로 이동
          </Link>
        </main>
      )}
    </div>
  );
}
