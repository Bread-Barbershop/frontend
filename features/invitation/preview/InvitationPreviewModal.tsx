'use client';

import { RotateCcw, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

import {
  INVITATION_PREVIEW_PATH,
  PREVIEW_MESSAGE,
  type PreviewSnapshot,
} from './previewSnapshot';

type PreviewLoadError = {
  message: string;
  onRetry: () => void;
};

type InvitationPreviewModalProps = {
  snapshot: PreviewSnapshot | null;
  source: 'draft' | 'saved';
  loadError?: PreviewLoadError;
  onClose: () => void;
};

export default function InvitationPreviewModal({
  snapshot,
  source,
  loadError,
  onClose,
}: InvitationPreviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const backdropDismiss = useBackdropDismiss<HTMLDialogElement>(onClose);
  const [session, setSession] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      focus?.focus({ preventScroll: true });
    };
  }, []);

  const restart = () => setSession(value => value + 1);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      {...backdropDismiss}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-[#252522] backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center sm:p-6"
    >
      <section className="flex h-full w-full max-w-[1040px] flex-col overflow-hidden bg-[#F5F4F0] sm:max-h-[940px] sm:rounded-[24px] sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-black/8 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-[17px] font-black tracking-[-0.06em]">
              invia
            </span>
            <span className="h-4 w-px bg-black/15" aria-hidden="true" />
            <h2 id={titleId} className="text-sm text-black/60">
              초대장 미리보기
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 닫기"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-hidden px-4 py-5 sm:px-8">
          <p className="text-center text-xs leading-relaxed text-black/50">
            {source === 'saved'
              ? '저장된 초대장의 하객 화면이에요.'
              : '저장 전 변경사항까지 반영한 하객 화면이에요.'}
          </p>
          <div className="relative min-h-0 w-full max-w-[390px] flex-1 overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_12px_40px_#0000000d]">
            {snapshot ? (
              <InvitationPreviewFrame
                key={session}
                snapshot={snapshot}
                onClose={onClose}
                onRetry={restart}
              />
            ) : (
              <PreviewFeedback error={loadError} />
            )}
          </div>
        </div>
        <footer className="flex shrink-0 items-center justify-between border-t border-black/8 px-6 py-4">
          <span className="text-xs text-black/45">
            화면을 내려 전체 초대장을 확인해 보세요.
          </span>
          <button
            type="button"
            disabled={!snapshot}
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-black/60 enabled:hover:bg-black/5 disabled:opacity-40"
          >
            <RotateCcw size={14} />
            처음부터 보기
          </button>
        </footer>
      </section>
    </dialog>,
    document.body
  );
}

function InvitationPreviewFrame({
  snapshot,
  onClose,
  onRetry,
}: {
  snapshot: PreviewSnapshot;
  onClose: () => void;
  onRetry: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useLayoutEffect(() => {
    const frameWindow = iframeRef.current?.contentWindow;
    const origin = window.location.origin;
    const timeout = window.setTimeout(() => setStatus('error'), 15_000);
    const receive = (event: MessageEvent) => {
      if (
        !frameWindow ||
        event.origin !== origin ||
        event.source !== frameWindow
      )
        return;

      if (event.data?.type === PREVIEW_MESSAGE.ready)
        frameWindow.postMessage(
          { type: PREVIEW_MESSAGE.snapshot, snapshot },
          origin
        );
      if (event.data?.type === PREVIEW_MESSAGE.rendered) {
        window.clearTimeout(timeout);
        setStatus('ready');
      }
      if (event.data?.type === PREVIEW_MESSAGE.close) onClose();
    };
    window.addEventListener('message', receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', receive);
    };
  }, [onClose, snapshot]);

  return (
    <>
      <iframe
        ref={iframeRef}
        src={INVITATION_PREVIEW_PATH}
        title="초대장 미리보기"
        className="h-full w-full border-0"
        aria-hidden={status !== 'ready'}
        tabIndex={status === 'ready' ? undefined : -1}
        allow="autoplay; clipboard-write; fullscreen"
      />
      {status !== 'ready' && (
        <PreviewFeedback
          error={
            status === 'error'
              ? { message: '미리보기를 불러오지 못했어요.', onRetry }
              : undefined
          }
        />
      )}
    </>
  );
}

function PreviewFeedback({ error }: { error?: PreviewLoadError }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#faf9f6] px-6 text-center text-sm text-text-secondary">
      <p role={error ? 'alert' : 'status'}>
        {error?.message ?? '초대장을 준비하고 있어요.'}
      </p>
      {error && (
        <button
          type="button"
          onClick={error.onRetry}
          className="rounded-lg border border-neutral-200 bg-white px-5 py-2"
        >
          다시 불러오기
        </button>
      )}
    </div>
  );
}
