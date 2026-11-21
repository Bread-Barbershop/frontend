import { ChevronRight, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

import type {
  InvitationPreviewTarget,
  InviteListItem,
} from '@/app/dashboard/types';
import type { AudienceGroup } from '@/features/invitation/audiences/model';
import EditIcon from '@/shared/assets/icons/edit.svg';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import { useToast } from '@/shared/hooks/useToast';

import DashboardActionButton from './DashboardActionButton';
import PreviewButton from './PreviewButton';

type AudienceOption = Pick<AudienceGroup, 'folderId' | 'name'> & {
  invitationUuid?: string;
};
type Props = { invite: InviteListItem } & (
  | { action: 'edit'; onSelect?: (folderId: string, uuid?: string) => void }
  | { action: 'preview'; onSelect?: (target: InvitationPreviewTarget) => void }
);

const LOAD_ERROR = '하객 그룹을 불러오지 못했어요. 다시 시도해 주세요.';

export default function InvitationAudienceButton({
  invite,
  action,
  onSelect,
}: Props) {
  const request = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [audiences, setAudiences] = useState<AudienceGroup[]>([]);
  const toast = useToast();
  const disabled = !onSelect || (action === 'edit' && !invite.invitationUuid);
  const title = invite.displayTitle ?? invite.name;
  const baseOption = {
    name: '기본 초대장',
    folderId: invite.folderId,
    invitationUuid: invite.invitationUuid,
  };

  function select(option: AudienceOption) {
    if (action === 'edit') {
      onSelect?.(option.folderId, option.invitationUuid);
    } else {
      onSelect?.({
        folderId: option.folderId,
        eventTitle: title,
        audienceName: option.name,
      });
    }
  }

  useEffect(() => () => request.current?.abort(), []);

  async function loadOptions() {
    if (request.current || disabled) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    const params = new URLSearchParams({
      folderId: invite.folderId,
      view: action === 'edit' ? 'editor-options' : 'preview-options',
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
        select(baseOption);
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

  const triggerProps = {
    disabled,
    'aria-disabled': loading || disabled,
    'aria-haspopup': 'dialog' as const,
    'aria-busy': loading,
    onClick(event: MouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      event.currentTarget.focus();
      void loadOptions();
    },
    onBlur() {
      if (!request.current) return;
      request.current.abort();
      request.current = null;
      setLoading(false);
    },
  };

  return (
    <>
      {action === 'edit' ? (
        <DashboardActionButton
          icon={EditIcon}
          variant="outline"
          {...triggerProps}
        >
          {loading ? '그룹 확인 중…' : '재편집하기'}
        </DashboardActionButton>
      ) : (
        <button
          type="button"
          className="cursor-pointer"
          aria-label={loading ? '그룹 확인 중…' : '초대장 미리보기'}
          {...triggerProps}
        >
          <PreviewButton loading={loading} />
        </button>
      )}
      {audiences.length > 0 && (
        <AudiencePicker
          title={
            action === 'edit'
              ? '어떤 초대장을 편집할까요?'
              : '어떤 초대장을 미리 볼까요?'
          }
          eventName={title}
          options={[baseOption, ...audiences]}
          onSelect={select}
          onClose={() => setAudiences([])}
        />
      )}
    </>
  );
}

function AudiencePicker({
  title,
  eventName,
  options,
  onSelect,
  onClose,
}: {
  title: string;
  eventName: string;
  options: AudienceOption[];
  onSelect: (option: AudienceOption) => void;
  onClose: () => void;
}) {
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
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-1 break-words text-sm text-text-secondary"
            >
              {eventName}
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
                  onClose();
                  onSelect(option);
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
