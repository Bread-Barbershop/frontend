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

import type {
  ShareAudienceLink,
  ShareAudienceWithKakao,
} from '../../carouselTypes';

type ShareOption = { folderId: string; name: string; url: string };
type ShareChannel = 'link' | 'kakao';
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
    folderId: group.folderId,
    name: group.slug ? group.name : '기본 초대장',
    url: new URL(
      buildAudienceGuestUrl(rootGuestUrl, group.slug),
      window.location.origin
    ).href,
  }));
}

export function useAudienceShare({
  invite,
  guestUrl,
  active,
  onCopyUrl,
  onKakao,
  isSharing,
}: {
  invite?: InviteListItem;
  guestUrl: string | null;
  active: boolean;
  onCopyUrl?: ShareAudienceLink;
  onKakao?: ShareAudienceWithKakao;
  isSharing: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const folderId = invite?.folderId;
  const request = useMemo(
    () => ({ folderId, guestUrl, active, attempt }),
    [folderId, guestUrl, active, attempt]
  );
  const [result, setResult] = useState<{
    request: typeof request;
    options?: ShareOption[];
    error?: string;
  } | null>(null);
  const options = result?.request === request ? result.options : undefined;
  const error = result?.request === request ? result.error : undefined;
  const dialog = useRef<HTMLDialogElement>(null);
  const [channel, setChannel] = useState<ShareChannel>('link');
  const pendingKakao = useRef<AbortController | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const eventId = useId();
  const linkEnabled = Boolean(active && guestUrl && onCopyUrl);
  const canLookUpKakao = Boolean(
    active &&
    onKakao &&
    (guestUrl || invite?.hasKakaoShareData || invite?.dataJsonFileId)
  );
  const enabled = linkEnabled || canLookUpKakao;
  const kakaoEnabled =
    canLookUpKakao &&
    Boolean(error || invite?.hasKakaoShareData || (options?.length ?? 0) > 1);

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
    return () => {
      controller.abort();
      pendingKakao.current?.abort();
      pendingKakao.current = null;
    };
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

  function share(option: ShareOption, via: ShareChannel) {
    if (!invite) return;
    if (via === 'link') {
      onCopyUrl?.(invite.folderId, option.url, option.name);
      return;
    }
    if (!onKakao || pendingKakao.current) return;
    const controller = new AbortController();
    pendingKakao.current = controller;
    void onKakao(invite.folderId, option.folderId, controller.signal).finally(
      () => {
        if (pendingKakao.current === controller) pendingKakao.current = null;
      }
    );
  }

  function buttonProps(via: ShareChannel, available: boolean) {
    return {
      disabled: !available || loading || isSharing,
      'aria-busy': loading || (via === 'kakao' && isSharing),
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
          share(options[0], via);
        } else {
          setChannel(via);
          dialog.current?.showModal();
        }
      },
    };
  }
  return {
    linkButtonProps: buttonProps('link', linkEnabled),
    kakaoButtonProps: buttonProps('kakao', kakaoEnabled),
    kakaoLabel:
      error && canLookUpKakao
        ? '카카오톡 공유 다시 준비하기'
        : isSharing
          ? '카카오톡 여는 중…'
          : '카카오톡 공유하기',
    linkLabel:
      error && linkEnabled
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
                disabled={
                  channel === 'kakao' &&
                  option.folderId === folderId &&
                  !invite.hasKakaoShareData
                }
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2 disabled:opacity-50"
                onClick={() => {
                  closePicker();
                  share(option, channel);
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
