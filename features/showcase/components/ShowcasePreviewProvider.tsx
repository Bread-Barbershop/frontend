'use client';

import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import NoticeConfirmButton from '@/components/atoms/button/NoticeConfirmButton';
import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_INVITATIONS,
  type ShowcaseInvitation,
} from '@/shared/data/showcaseInvitations';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

import type { ReactNode, RefObject } from 'react';

const ShowcasePreviewContext = createContext<(id: string) => void>(() => {});

export function useShowcasePreview() {
  return useContext(ShowcasePreviewContext);
}

export default function ShowcasePreviewProvider({
  children,
  invitationIds,
}: {
  children: ReactNode;
  invitationIds?: readonly string[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const close = useCallback(() => setSelectedId(null), []);
  const invitations = invitationIds
    ? SHOWCASE_INVITATIONS.filter(invitation =>
        invitationIds.includes(invitation.id)
      )
    : SHOWCASE_INVITATIONS;
  const index = invitations.findIndex(
    invitation => invitation.id === selectedId
  );

  return (
    <ShowcasePreviewContext.Provider value={setSelectedId}>
      {children}
      {index >= 0 && (
        <ShowcasePreviewModal
          invitations={invitations}
          index={index}
          onSelect={setSelectedId}
          onClose={close}
        />
      )}
    </ShowcasePreviewContext.Provider>
  );
}

function ShowcasePreviewModal({
  invitations,
  index,
  onSelect,
  onClose,
}: {
  invitations: readonly ShowcaseInvitation[];
  index: number;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pcNoticeRef = useRef<HTMLDialogElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const backdropDismiss = useBackdropDismiss<HTMLDialogElement>(onClose);
  const closePcNotice = () => pcNoticeRef.current?.close();
  const pcNoticeBackdropDismiss = useBackdropDismiss<HTMLDialogElement>(
    closePcNotice,
    'outside-dialog'
  );
  const design = invitations[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();

    const receiveMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === iframeRef.current?.contentWindow &&
        event.data?.type === 'invia:close-showcase'
      ) {
        onClose();
      }
    };
    window.addEventListener('message', receiveMessage);
    return () => {
      window.removeEventListener('message', receiveMessage);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  function move(direction: -1 | 1) {
    const nextIndex =
      (index + direction + invitations.length) % invitations.length;
    onSelect(invitations[nextIndex].id);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={design.name}
      aria-describedby="showcase-preview-description"
      onCancel={event => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        onClose();
      }}
      {...backdropDismiss}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-[#252522] backdrop:bg-black/55 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center min-[800px]:p-9"
    >
      <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#F5F4F0] min-[800px]:max-h-[920px] min-[800px]:max-w-[1050px] min-[800px]:rounded-[24px] min-[800px]:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-black/8 pt-[max(3.5px,env(safe-area-inset-top))] pr-2.5 pb-[3.5px] pl-3.5 max-[359px]:gap-1 max-[359px]:pr-1 max-[359px]:pl-2.5 min-[800px]:px-7 min-[800px]:py-4">
          <div className="flex min-w-0 items-center gap-2 max-[359px]:gap-1.5 min-[800px]:gap-3">
            <span className="shrink-0 text-[15px] font-black tracking-[-0.06em]">
              invia
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px shrink-0 bg-black/15"
            />
            <span className="min-w-0 truncate text-[12px] text-black/55 max-[359px]:text-[11.5px]">
              초대장 미리보기
              <span aria-live="polite" className="min-[800px]:hidden">
                {' - '}
                {design.name}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 닫기"
            className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-black/5 px-2.5 text-xs font-semibold whitespace-nowrap text-black/70 transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 min-[800px]:h-10 min-[800px]:px-3"
          >
            닫기
            <X
              aria-hidden="true"
              strokeWidth={1.5}
              className="size-4 min-[800px]:size-5"
            />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col min-[800px]:flex-row">
          <aside className="hidden w-[340px] shrink-0 flex-col justify-between px-9 py-10 min-[800px]:flex">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-black/45">
                THE INVIA COLLECTION
              </p>
              <div className="mt-8 flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: design.palette[1] }}
                />
                <p className="text-[11px] text-black/55">
                  {SHOWCASE_CATEGORY_LABELS[design.type]}
                </p>
              </div>
              <h2 className="mt-4 text-[30px] leading-[1.3] font-semibold tracking-[-0.04em]">
                {design.name}
              </h2>
              <p
                id="showcase-preview-description"
                className="mt-4 break-keep text-[14px] leading-7 text-black/55"
              >
                {design.description}
              </p>
              <div aria-label="초대장 색상" className="mt-7 flex gap-2">
                {design.palette.map((color, i) => (
                  <span
                    key={i}
                    className="size-5 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-8">
              <Link
                href={`/editor?template=${encodeURIComponent(design.id)}`}
                className="flex min-h-11 w-full items-center justify-center gap-3 rounded-full bg-bg-plain px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#202020] focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                이 템플릿으로 시작하기{' '}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <p className="mt-3 text-[11px] leading-5 text-black/45">
                로그인 후 이 디자인으로 바로 시작해요.
                <br />
                사진과 문구는 자유롭게 바꿀 수 있어요.
              </p>
            </div>
          </aside>

          <div className="relative flex min-h-0 flex-1 justify-center bg-[#E8E7E2] min-[800px]:p-6 min-[800px]:pb-0">
            <div className="relative h-full w-full max-w-[430px] overflow-hidden bg-white shadow-[0_4px_32px_#0000000d] min-[800px]:rounded-t-[18px]">
              <PreviewFrame
                key={design.id}
                id={design.id}
                name={design.name}
                iframeRef={iframeRef}
              />
            </div>
          </div>
        </div>

        <nav
          aria-label="다른 초대장 미리보기"
          className="grid shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center justify-between gap-4 border-t border-black/8 px-2.5 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] min-[800px]:flex min-[800px]:px-7 min-[800px]:py-3"
        >
          <button
            type="button"
            onClick={() => move(-1)}
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[12px] transition-colors hover:bg-black/5 min-[800px]:min-h-10 min-[800px]:px-3"
            aria-label="이전 초대장"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="hidden min-[800px]:inline">이전</span>
          </button>
          <p
            className="hidden text-[11px] tabular-nums tracking-[0.12em] text-black/45 min-[800px]:block"
            aria-live="polite"
          >
            {String(index + 1).padStart(2, '0')}{' '}
            <span className="mx-2 opacity-40">/</span> {invitations.length}
          </p>
          <button
            type="button"
            onClick={event => {
              event.currentTarget.focus({ preventScroll: true });
              pcNoticeRef.current?.showModal();
            }}
            className="min-h-11 w-[126px] max-w-full cursor-pointer justify-self-center rounded-full bg-bg-plain px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D] min-[800px]:hidden"
          >
            이거 쓸래요
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[12px] transition-colors hover:bg-black/5 min-[800px]:min-h-10 min-[800px]:px-3"
            aria-label="다음 초대장"
          >
            <span className="hidden min-[800px]:inline">다음</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </nav>
      </section>
      <dialog
        ref={pcNoticeRef}
        {...pcNoticeBackdropDismiss}
        aria-labelledby="showcase-pc-notice-title"
        aria-describedby="showcase-pc-notice-description"
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-dvh w-full max-w-none overflow-auto overscroll-contain rounded-t-[22px] border border-black/8 bg-[#F9F8F3] px-6 pt-6 pb-[max(24px,env(safe-area-inset-bottom))] text-text-plain backdrop:bg-black/40"
      >
        <h2
          id="showcase-pc-notice-title"
          className="break-keep text-[22px] font-bold tracking-[-0.045em]"
        >
          {design.name} 시작하기
        </h2>
        <p
          id="showcase-pc-notice-description"
          className="mt-3 mb-5 break-keep text-sm leading-relaxed text-black/60"
        >
          이 템플릿은 PC에서 로그인한 뒤 사용할 수 있어요.
        </p>
        <div className="flex justify-center">
          <NoticeConfirmButton onClick={closePcNotice} />
        </div>
      </dialog>
    </dialog>
  );
}

function PreviewFrame({
  id,
  name,
  iframeRef,
}: {
  id: string;
  name: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <>
      {!isLoaded && (
        <div
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#FAF9F6] text-[12px] text-black/50"
        >
          <span className="size-6 animate-spin rounded-full border border-black/10 border-t-black/60" />
          초대장을 펼치고 있어요
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={`${name} 초대장 내용`}
        src={`/showcase/${id}`}
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full border-0 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}
