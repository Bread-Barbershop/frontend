'use client';

import { ArrowDown, ArrowLeft, ArrowRight, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  getShowcaseInvitation,
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_INVITATIONS,
} from '@/shared/data/showcaseInvitations';

import type { ReactNode, RefObject } from 'react';

const ShowcasePreviewContext = createContext<(id: string) => void>(() => {});

export function useShowcasePreview() {
  return useContext(ShowcasePreviewContext);
}

export default function ShowcasePreviewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const close = useCallback(() => setSelectedId(null), []);

  return (
    <ShowcasePreviewContext.Provider value={setSelectedId}>
      {children}
      {selectedId && (
        <ShowcasePreviewModal
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClose={close}
        />
      )}
    </ShowcasePreviewContext.Provider>
  );
}

function ShowcasePreviewModal({
  selectedId,
  onSelect,
  onClose,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const design = getShowcaseInvitation(selectedId)!;
  const index = SHOWCASE_INVITATIONS.findIndex(item => item.id === selectedId);

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
      (index + direction + SHOWCASE_INVITATIONS.length) %
      SHOWCASE_INVITATIONS.length;
    onSelect(SHOWCASE_INVITATIONS[nextIndex].id);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="showcase-preview-title"
      aria-describedby="showcase-preview-description"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-[#252522] backdrop:bg-black/55 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center min-[800px]:p-9"
    >
      <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#F5F4F0] min-[800px]:max-h-[920px] min-[800px]:max-w-[1050px] min-[800px]:rounded-[24px] min-[800px]:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-black/8 px-5 py-3 min-[800px]:px-7 min-[800px]:py-4">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-black tracking-[-0.06em]">
              invia
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-black/15" />
            <span className="text-[12px] text-black/55">초대장 미리보기</span>
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

        <div className="flex min-h-0 flex-1 flex-col min-[800px]:flex-row">
          <aside className="flex shrink-0 flex-col px-5 py-3 min-[800px]:w-[340px] min-[800px]:justify-between min-[800px]:px-9 min-[800px]:py-10">
            <div>
              <p className="hidden text-[11px] tracking-[0.2em] text-black/45 min-[800px]:block">
                THE INVIA COLLECTION
              </p>
              <div className="flex items-center gap-2 min-[800px]:mt-8">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: design.palette[1] }}
                />
                <p className="text-[11px] text-black/55">
                  {SHOWCASE_CATEGORY_LABELS[design.type]}
                </p>
                <span className="ml-auto text-[11px] tabular-nums text-black/40 min-[800px]:hidden">
                  {String(index + 1).padStart(2, '0')} /{' '}
                  {SHOWCASE_INVITATIONS.length}
                </span>
              </div>
              <h2
                id="showcase-preview-title"
                className="mt-1 text-xl font-semibold tracking-[-0.04em] min-[800px]:mt-4 min-[800px]:text-[30px] min-[800px]:leading-[1.3]"
              >
                {design.name}
              </h2>
              <p
                id="showcase-preview-description"
                className="mt-4 hidden break-keep text-[14px] leading-7 text-black/55 min-[800px]:block"
              >
                {design.description}
              </p>
              <div
                aria-label="초대장 색상"
                className="mt-7 hidden gap-2 min-[800px]:flex"
              >
                {design.palette.map((color, i) => (
                  <span
                    key={i}
                    className="size-5 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-8 hidden min-[800px]:block">
              <div className="mb-8 flex items-center gap-2 text-[12px] text-black/45">
                <ArrowDown size={14} />
                스크롤하며 초대장 전체를 살펴보세요
              </div>
              <p className="border-t border-black/10 pt-5 text-[12px] leading-6 text-black/45">
                마음에 드는 분위기를 발견하셨나요?
                <br />첫 화면의 ‘무료로 제작하기’에서
                <br />
                우리만의 이야기를 시작해 보세요.
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
          className="flex shrink-0 items-center justify-between border-t border-black/8 px-5 py-2 pb-[max(8px,env(safe-area-inset-bottom))] min-[800px]:px-7 min-[800px]:py-3"
        >
          <button
            type="button"
            onClick={() => move(-1)}
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-[12px] transition-colors hover:bg-black/5"
            aria-label="이전 초대장"
          >
            <ArrowLeft size={16} />
            이전
          </button>
          <p
            className="text-[11px] tabular-nums tracking-[0.12em] text-black/45"
            aria-live="polite"
          >
            {String(index + 1).padStart(2, '0')}{' '}
            <span className="mx-2 opacity-40">/</span>{' '}
            {SHOWCASE_INVITATIONS.length}
          </p>
          <button
            type="button"
            onClick={() => move(1)}
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-[12px] transition-colors hover:bg-black/5"
            aria-label="다음 초대장"
          >
            다음
            <ArrowRight size={16} />
          </button>
        </nav>
      </section>
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
