import { ChevronRight, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { InviteListItem } from '@/app/dashboard/types';
import type { AudienceGroup } from '@/features/invitation/audiences/model';
import EditIcon from '@/shared/assets/icons/edit.svg';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import { useToast } from '@/shared/hooks/useToast';

import DashboardActionButton from './DashboardActionButton';

type Props = {
  invite: InviteListItem;
  onEdit?: (folderId: string, uuid?: string) => void;
};

const LOAD_ERROR = '하객 그룹을 불러오지 못했어요. 다시 시도해 주세요.';

export default function EditInvitationButton({ invite, onEdit }: Props) {
  const request = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [audiences, setAudiences] = useState<AudienceGroup[]>([]);
  const toast = useToast();

  useEffect(() => () => request.current?.abort(), []);

  async function openEditor() {
    if (request.current || !onEdit || !invite.invitationUuid) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    const params = new URLSearchParams({
      folderId: invite.folderId,
      view: 'editor-options',
    });
    try {
      const response = await fetch(`/api/drive/invitationAudiences?${params}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !Array.isArray(data?.audiences)) {
        toast.error(
          typeof data?.message === 'string' ? data.message : LOAD_ERROR
        );
        return;
      }
      if (data.audiences.length) {
        setAudiences(data.audiences);
      } else {
        onEdit(invite.folderId, invite.invitationUuid);
      }
    } catch {
      if (!controller.signal.aborted) toast.error(LOAD_ERROR);
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }

  return (
    <>
      <DashboardActionButton
        icon={EditIcon}
        variant="outline"
        disabled={!invite.invitationUuid || !onEdit}
        aria-disabled={loading || !invite.invitationUuid || !onEdit}
        aria-haspopup="dialog"
        aria-busy={loading}
        onClick={event => {
          event.currentTarget.focus();
          void openEditor();
        }}
        onBlur={() => {
          if (!request.current) return;
          request.current.abort();
          request.current = null;
          setLoading(false);
        }}
      >
        {loading ? '그룹 확인 중…' : '재편집하기'}
      </DashboardActionButton>
      {audiences.length > 0 && (
        <AudiencePicker
          invite={invite}
          audiences={audiences}
          onEdit={onEdit}
          onClose={() => setAudiences([])}
        />
      )}
    </>
  );
}

function AudiencePicker({
  invite,
  audiences,
  onEdit,
  onClose,
}: Props & { audiences: AudienceGroup[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const backdropDismiss = useBackdropDismiss<HTMLDialogElement>(
    onClose,
    'outside-dialog'
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement)
        trigger.focus({ preventScroll: true });
    };
  }, []);

  const options = [
    {
      name: '기본 초대장',
      folderId: invite.folderId,
      invitationUuid: invite.invitationUuid,
    },
    ...audiences,
  ];
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      {...backdropDismiss}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(420px,calc(100vw-32px))] overflow-y-auto rounded-2xl bg-white p-0 text-text-plain shadow-xl backdrop:bg-black/50 motion-safe:animate-[fade-in_180ms_ease-out]"
    >
      <section className="p-6" onClick={event => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              어떤 초대장을 편집할까요?
            </h2>
            <p
              id={descriptionId}
              className="mt-1 break-words text-sm text-text-secondary"
            >
              {invite.displayTitle ?? invite.name}
            </p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-neutral-100"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <ul className="mt-5 grid gap-2">
          {options.map(option => (
            <li key={option.folderId}>
              <button
                type="button"
                onClick={() => {
                  onEdit?.(option.folderId, option.invitationUuid);
                  onClose();
                }}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="min-w-0 break-words">{option.name}</span>
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-neutral-500"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </dialog>,
    document.body
  );
}
