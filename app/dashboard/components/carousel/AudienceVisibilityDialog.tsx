import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { InviteListItem } from '@/app/dashboard/types';
import type { AudienceVisibilityOptions } from '@/features/invitation/audiences/visibility';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

type Props = {
  invite: InviteListItem;
  onClose: () => void;
  onSaved: () => void;
};

function PublicSwitch({
  name,
  checked,
  disabled,
  onChange,
}: {
  name: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 py-2">
      <span className="min-w-0 break-words text-sm font-medium">{name}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span aria-hidden="true" className="text-xs text-text-secondary">
          {checked ? '공개' : '비공개'}
        </span>
        <input
          type="checkbox"
          role="switch"
          aria-label={`${name} 공개`}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 rounded-full bg-neutral-400 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-blue-700 peer-checked:after:translate-x-5 peer-disabled:opacity-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 motion-reduce:transition-none"
        />
      </span>
    </label>
  );
}

export default function AudienceVisibilityDialog({
  invite,
  onClose,
  onSaved,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const applying = useRef(false);
  const titleId = useId();
  const [options, setOptions] = useState<AudienceVisibilityOptions | null>(
    null
  );
  const [published, setPublished] = useState(false);
  const [publicSlugs, setPublicSlugs] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dismiss = () => {
    if (!applying.current) onClose();
  };
  const backdrop = useBackdropDismiss<HTMLDialogElement>(
    dismiss,
    'outside-dialog'
  );
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          `/api/drive/audienceVisibility?folderId=${encodeURIComponent(invite.folderId)}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message ?? '설정을 불러오지 못했어요.');
        if (!controller.signal.aborted) {
          setOptions(data);
          setPublished(data.visibility.published);
          setPublicSlugs(data.visibility.publicSlugs);
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : '설정을 불러오지 못했어요.'
          );
      }
    }
    void load();
    return () => controller.abort();
  }, [invite.folderId, attempt]);

  function toggleGroup(slug: string) {
    const next = publicSlugs.includes(slug)
      ? publicSlugs.filter(s => s !== slug)
      : [...publicSlugs, slug];
    if (!next.length) setPublished(false);
    else setPublicSlugs(next);
  }
  async function apply() {
    if (!options || applying.current) return;
    applying.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/drive/audienceVisibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: invite.folderId,
          published,
          publicSlugs,
          revision: options.visibility.revision,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? '공개 범위 적용에 실패했어요.');
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : '공개 범위 적용에 실패했어요.');
      setOptions(null);
    } finally {
      applying.current = false;
      setBusy(false);
    }
  }
  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        dismiss();
      }}
      {...backdrop}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(420px,calc(100vw-32px))] overflow-y-auto rounded-2xl bg-white p-6 text-text-plain shadow-xl backdrop:bg-black/50 motion-safe:open:animate-[fade-in_180ms_ease-out]"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        공개 범위 설정
      </h2>
      <p className="mb-4 break-words text-sm text-text-secondary">
        {invite.displayTitle ?? invite.name}
      </p>
      {options ? (
        <>
          <PublicSwitch
            name="행사 전체"
            checked={published}
            disabled={busy}
            onChange={() => setPublished(!published)}
          />
          <p className="mb-3 text-xs text-text-secondary">
            행사 전체를 끄면 모든 하객 링크가 닫혀요. 다시 켜면 아래 설정이
            복원돼요.
          </p>
          <div className="border-t border-neutral-200 pt-1">
            {options.groups.map(group => (
              <PublicSwitch
                key={group.slug}
                name={group.name}
                checked={published && publicSlugs.includes(group.slug)}
                disabled={!published || busy}
                onChange={() => toggleGroup(group.slug)}
              />
            ))}
          </div>
          {options.visibility.pending && (
            <p role="status">
              공개 범위 적용이 끝나지 않았어요. 설정을 확인하고 다시 적용해
              주세요.
            </p>
          )}
        </>
      ) : (
        !error && <p role="status">공개 범위를 불러오는 중이에요.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-status-error">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={dismiss}
          className="rounded-lg border px-4 py-2"
        >
          취소
        </button>
        {!options && error ? (
          <button
            type="button"
            onClick={() => {
              setError('');
              setAttempt(value => value + 1);
            }}
            className="rounded-lg border px-4 py-2"
          >
            다시 불러오기
          </button>
        ) : (
          <button
            type="button"
            disabled={!options || busy}
            onClick={() => void apply()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? '적용 중…' : '적용'}
          </button>
        )}
      </div>
    </dialog>,
    document.body
  );
}
