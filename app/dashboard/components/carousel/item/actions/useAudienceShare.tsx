import { ChevronRight } from 'lucide-react';
import {
  type MouseEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { InviteListItem } from '@/app/dashboard/types';
import {
  buildAudienceGuestUrl,
  type AudienceGroupList,
} from '@/features/invitation/audiences/model';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

import type { ShareAudienceLink } from '../../carouselTypes';

type ShareOption = { name: string; url: string };
const LOAD_ERROR = '공유할 하객 그룹을 불러오지 못했어요.';

async function loadShareOptions(
  folderId: string,
  signal: AbortSignal
): Promise<ShareOption[]> {
  const params = new URLSearchParams({ folderId });
  const response = await fetch(`/api/drive/invitationAudiences?${params}`, {
    cache: 'no-store',
    signal,
  });
  const list = await response.json();
  if (!response.ok) throw new Error(list?.message ?? LOAD_ERROR);
  const { groups, rootGuestUrl } = list as AudienceGroupList;
  if (
    !rootGuestUrl ||
    !Array.isArray(groups) ||
    !groups.some(group => group.folderId === folderId && group.slug === '')
  ) {
    throw new Error(LOAD_ERROR);
  }
  return groups.map(group => ({
    name: group.slug ? group.name : '기본 초대장',
    url: new URL(
      buildAudienceGuestUrl(rootGuestUrl, group.slug),
      window.location.origin
    ).href,
  }));
}

export function useAudienceShare(
  invite: InviteListItem | undefined,
  guestUrl: string | null,
  onShare?: ShareAudienceLink
) {
  const [attempt, setAttempt] = useState(0);
  const folderId = invite?.folderId;
  const request = useMemo(
    () => ({ folderId, guestUrl, attempt }),
    [folderId, guestUrl, attempt]
  );
  const [result, setResult] = useState<{
    request: typeof request;
    options?: ShareOption[];
    error?: string;
  } | null>(null);
  const options = result?.request === request ? result.options : undefined;
  const error = result?.request === request ? result.error : undefined;
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const eventId = useId();
  const enabled = Boolean(guestUrl && onShare);

  // 선택된 카드에서 목록을 미리 준비해야 복사가 사용자 클릭 안에서 실행된다.
  useEffect(() => {
    if (!enabled || !request.folderId) return;
    const controller = new AbortController();
    loadShareOptions(request.folderId, controller.signal).then(
      next => {
        if (!controller.signal.aborted) setResult({ request, options: next });
      },
      err => {
        if (!controller.signal.aborted)
          setResult({
            request,
            error: (err instanceof Error && err.message) || LOAD_ERROR,
          });
      }
    );
    return () => controller.abort();
  }, [enabled, request]);

  function closePicker() {
    dialog.current?.close();
    trigger.current?.focus({ preventScroll: true });
  }
  const backdrop = useBackdropDismiss<HTMLDialogElement>(
    closePicker,
    'outside-dialog'
  );
  const loading = enabled && !error && !options;

  return {
    buttonProps: {
      disabled: !enabled || loading,
      'aria-busy': loading,
      'aria-haspopup':
        options && options.length > 1 ? ('dialog' as const) : undefined,
      title: error,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        if (error) {
          setAttempt(previous => previous + 1);
          return;
        }
        if (!options?.length || !invite) return;
        trigger.current = event.currentTarget;
        trigger.current.focus();
        if (options.length === 1) {
          onShare?.(invite.folderId, options[0].url, options[0].name);
        } else {
          dialog.current?.showModal();
        }
      },
    },
    label: error
      ? '공유 다시 준비하기'
      : loading
        ? '공유 준비 중…'
        : 'URL 링크 공유하기',
    picker: invite && options && options.length > 1 && (
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={eventId}
        {...backdrop}
        onClick={event => {
          event.stopPropagation();
          backdrop.onClick(event);
        }}
        onCancel={event => {
          event.preventDefault();
          closePicker();
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(400px,calc(100vw-32px))] overflow-y-auto rounded-2xl bg-white p-6 text-left text-text-plain shadow-xl backdrop:bg-black/50 motion-safe:open:animate-[fade-in_180ms_ease-out]"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          누구에게 보낼 초대장인가요?
        </h2>
        <p
          id={eventId}
          className="mt-1 break-words text-sm text-text-secondary"
        >
          {invite.displayTitle ?? invite.name}
        </p>
        <ul className="mt-5 grid gap-2">
          {options.map(option => (
            <li key={option.url}>
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2"
                onClick={() => {
                  closePicker();
                  onShare?.(invite.folderId, option.url, option.name);
                }}
              >
                <span className="min-w-0 break-words">{option.name}</span>
                <ChevronRight
                  aria-hidden="true"
                  size={16}
                  className="shrink-0 text-neutral-500"
                />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={closePicker}
          className="mt-3 min-h-10 w-full rounded-lg text-sm text-gray-600 hover:bg-neutral-50"
        >
          닫기
        </button>
      </dialog>
    ),
  };
}
