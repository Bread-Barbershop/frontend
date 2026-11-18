'use client';

import { Check, Copy, Plus, X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  type AudienceGroup,
  type AudienceGroupList,
  buildAudienceGuestUrl,
  MAX_AUDIENCE_NAME_LENGTH,
  MAX_AUDIENCE_SLUG_LENGTH,
  normalizeAudienceNameForComparison,
  validateAudienceName,
  validateAudienceSlug,
} from '@/features/invitation/audiences/model';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

import type { useInvitationUpload } from '../hooks/useInvitationUpload';

type Upload = Pick<
  ReturnType<typeof useInvitationUpload>,
  'handleUpload' | 'isLoading' | 'isCleaningUp' | 'loadingMessage'
>;

type Props = {
  upload: Upload;
  onClose: () => void;
  onOpenEditor: (group: AudienceGroup) => void;
};

type GroupDraft = { sourceFolderId: string; name: string; slug: string };
type Action =
  | { type: 'firstSave' }
  | { type: 'switch'; group: AudienceGroup }
  | { type: 'create'; draft: GroupDraft };
type ListResult =
  | { key: string; groups: AudienceGroupList }
  | { key: string; error: string };

const AUDIENCES_API = '/api/drive/invitationAudiences';
const LOAD_ERROR = '하객 그룹을 불러오지 못했어요.';
const CREATE_ERROR = '하객 그룹을 추가하지 못했어요. 다시 시도해 주세요.';
const SAVE_ERROR = '현재 초대장을 저장하지 못했어요. 다시 시도해 주세요.';

const FIELD_CLASS =
  'block h-10 w-full rounded-lg border border-[#deddd6] bg-white px-3 text-sm text-text-primary placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#55715d] aria-invalid:border-[#a3212d] disabled:bg-neutral-100';
const PRIMARY_BUTTON =
  'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#26382c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#374e3e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55715d] disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY_BUTTON =
  'inline-flex min-h-10 items-center justify-center rounded-lg border border-[#deddd6] bg-white px-3 text-sm font-semibold hover:bg-[#f7f6f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55715d] disabled:cursor-not-allowed disabled:opacity-50';

async function readAudienceResponse<T>(
  url: string,
  fallback: string,
  init: RequestInit
): Promise<T> {
  const response = await fetch(url, init).catch(() => null);
  const payload = await response?.json().catch(() => null);

  if (!response?.ok || !payload) {
    throw new Error(
      typeof payload?.message === 'string' ? payload.message : fallback
    );
  }
  return payload as T;
}

export default function InvitationAudiencesDialog({
  upload,
  onClose,
  onOpenEditor,
}: Props) {
  const folderId = useEditorStore(state => state.invitationFolderId);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const confirmationCancelRef = useRef<HTMLButtonElement>(null);
  const actionTriggerRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);
  const createRequestIds = useRef(new Map<string, string>());
  const titleId = useId();
  const listId = useId();
  const newGroupId = useId();
  const slugHelpId = useId();
  const errorId = useId();

  const [listResult, setListResult] = useState<ListResult | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sourceFolderId, setSourceFolderId] = useState('');
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [operation, setOperation] = useState<
    'saving' | 'creating' | 'opening' | null
  >(null);
  const [error, setError] = useState<{
    message: string;
    field?: 'name' | 'slug';
  } | null>(null);
  const [copiedFolderId, setCopiedFolderId] = useState('');

  const listKey = `${folderId}:${loadAttempt}`;
  const currentList = listResult?.key === listKey ? listResult : null;
  const list =
    currentList && 'groups' in currentList ? currentList.groups : null;
  const groupOptions = list?.groups ?? [];
  const source =
    groupOptions.find(group => group.folderId === sourceFolderId) ??
    groupOptions[0];
  const busy = operation !== null || upload.isLoading || upload.isCleaningUp;
  const operationMessage =
    operation === 'saving'
      ? upload.loadingMessage
      : operation === 'creating'
        ? '초대장을 복제하고 있어요.'
        : operation === 'opening'
          ? '초대장 편집기를 열고 있어요.'
          : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    titleRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (!folderId) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ folderId });

    void readAudienceResponse<AudienceGroupList>(
      `${AUDIENCES_API}?${params}`,
      LOAD_ERROR,
      {
        cache: 'no-store',
        signal: controller.signal,
      }
    ).then(
      groups => {
        if (controller.signal.aborted) return;
        if (
          !Array.isArray(groups.groups) ||
          !groups.groups.length ||
          !groups.rootGuestUrl
        ) {
          setListResult({ key: listKey, error: LOAD_ERROR });
          return;
        }
        setListResult({ key: listKey, groups });
      },
      err => {
        if (!controller.signal.aborted) {
          setListResult({
            key: listKey,
            error: err instanceof Error ? err.message : LOAD_ERROR,
          });
        }
      }
    );

    return () => controller.abort();
  }, [folderId, listKey]);

  useEffect(() => {
    if (pendingAction) {
      confirmationCancelRef.current?.focus();
    } else {
      actionTriggerRef.current?.focus();
      actionTriggerRef.current = null;
    }
  }, [pendingAction]);

  function closeDialog() {
    if (!busyRef.current && !busy) onClose();
  }

  const backdropDismiss = useBackdropDismiss<HTMLDialogElement>(
    closeDialog,
    'outside-dialog'
  );

  async function continueAction(action: Action) {
    if (busyRef.current || busy) return;
    busyRef.current = true;
    setError(null);

    let opening = false;
    let fallback = CREATE_ERROR;
    try {
      const editor = useEditorStore.getState();
      if (action.type === 'firstSave' || editor.isDirty) {
        fallback = SAVE_ERROR;
        setOperation('saving');
        const saved = await upload.handleUpload({
          preserveVisibility: Boolean(editor.invitationFolderId),
        });
        if (!saved) throw new Error(SAVE_ERROR);
      }

      setPendingAction(null);
      if (action.type === 'firstSave') return;

      let group: AudienceGroup;
      if (action.type === 'create') {
        fallback = CREATE_ERROR;
        setOperation('creating');
        const key = JSON.stringify([
          folderId,
          action.draft.sourceFolderId,
          action.draft.name,
          action.draft.slug,
        ]);
        const requestId =
          createRequestIds.current.get(key) ?? crypto.randomUUID();
        createRequestIds.current.set(key, requestId);
        const result = await readAudienceResponse<{
          group: AudienceGroup;
          rootGuestUrl: string;
        }>(AUDIENCES_API, CREATE_ERROR, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId, ...action.draft, requestId }),
        });
        if (!result.group?.folderId || !result.group.invitationUuid)
          throw new Error(CREATE_ERROR);
        createRequestIds.current.delete(key);
        group = result.group;
      } else {
        group = action.group;
      }

      setOperation('opening');
      onOpenEditor(group);
      opening = true;
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : fallback });
    } finally {
      if (!opening) {
        setOperation(null);
        busyRef.current = false;
      }
    }
  }

  function requestAction(action: Action) {
    if (busyRef.current || busy) return;
    setError(null);
    if (useEditorStore.getState().isDirty) {
      actionTriggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setPendingAction(action);
    } else {
      void continueAction(action);
    }
  }

  function submitGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source || pendingAction || busy) return;

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const nameKey = normalizeAudienceNameForComparison(trimmedName);
    const nameError =
      validateAudienceName(trimmedName) ??
      (groupOptions.some(
        group => normalizeAudienceNameForComparison(group.name) === nameKey
      )
        ? '이미 사용 중인 대상 이름이에요.'
        : null);
    const slugError =
      validateAudienceSlug(trimmedSlug) ??
      (groupOptions.some(group => group.slug === trimmedSlug)
        ? '이미 사용 중인 링크 영문명이에요.'
        : null);
    if (nameError) {
      setError({ field: 'name', message: nameError });
      nameRef.current?.focus();
      return;
    }
    if (slugError) {
      setError({ field: 'slug', message: slugError });
      slugRef.current?.focus();
      return;
    }

    requestAction({
      type: 'create',
      draft: {
        sourceFolderId: source.folderId,
        name: trimmedName,
        slug: trimmedSlug,
      },
    });
  }

  async function copyGroupLink(group: AudienceGroup) {
    if (!list) return;
    try {
      const path = buildAudienceGuestUrl(list.rootGuestUrl, group.slug);
      await navigator.clipboard.writeText(
        new URL(path, window.location.origin).href
      );
      setError(null);
      setCopiedFolderId(group.folderId);
    } catch {
      setError({ message: '링크를 복사하지 못했어요. 다시 시도해 주세요.' });
    }
  }

  const exampleSlug = slug.trim() || 'family';
  const example =
    list && !validateAudienceSlug(exampleSlug)
      ? buildAudienceGuestUrl(list.rootGuestUrl, exampleSlug)
      : '—';

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        closeDialog();
      }}
      {...backdropDismiss}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(560px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-[#deddd6] bg-white p-0 font-pretendard text-text-primary shadow-edit backdrop:bg-black/50"
    >
      <section className="grid gap-5 p-5 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <h2
            id={titleId}
            ref={titleRef}
            tabIndex={-1}
            className="text-lg font-semibold focus:outline-none"
          >
            하객별 구분
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={closeDialog}
            disabled={busy}
            className="grid size-9 place-items-center rounded-lg hover:bg-[#f7f6f3] focus-visible:outline-2 disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {!folderId && (
          <div className="grid gap-3 rounded-xl border border-[#deddd6] bg-[#f7f6f3] p-4">
            <p className="text-sm leading-6">
              하객 그룹을 추가하려면 현재 초대장을 먼저 저장해 주세요. 첫 저장
              시 기본 초대장이 공개돼요.
            </p>
            <button
              type="button"
              className={cn(PRIMARY_BUTTON, 'justify-self-end')}
              disabled={busy}
              onClick={() => void continueAction({ type: 'firstSave' })}
            >
              저장 후 계속
            </button>
          </div>
        )}

        {folderId && !currentList && (
          <p role="status" className="text-sm text-neutral-600">
            하객 그룹을 불러오는 중이에요.
          </p>
        )}
        {currentList && 'error' in currentList && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="alert" className="text-sm text-[#a3212d]">
              {currentList.error}
            </p>
            <button
              type="button"
              className={SECONDARY_BUTTON}
              disabled={busy}
              onClick={() => setLoadAttempt(attempt => attempt + 1)}
            >
              다시 불러오기
            </button>
          </div>
        )}

        {list && (
          <>
            <section aria-labelledby={listId} className="grid gap-2.5">
              <h3 id={listId} className="text-sm font-semibold">
                편집 대상
              </h3>
              <ul className="grid max-h-56 gap-2 overflow-y-auto">
                {groupOptions.map(group => {
                  const active = group.slug === (list.activeSlug ?? '');
                  const path = buildAudienceGuestUrl(
                    list.rootGuestUrl,
                    group.slug
                  );
                  return (
                    <li
                      key={group.folderId}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-[#deddd6] px-2 py-1.5',
                        active && 'border-[#c6d4c5] bg-[#e9eee6] text-[#293c2d]'
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        disabled={busy || Boolean(pendingAction)}
                        onClick={() => {
                          if (!active) requestAction({ type: 'switch', group });
                        }}
                        className="min-w-0 flex-1 rounded px-2 py-1.5 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#55715d]"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          {active && <Check size={14} aria-hidden="true" />}
                          <span className="truncate">{group.name}</span>
                          {active && (
                            <span className="shrink-0 text-xs font-medium">
                              편집 중
                            </span>
                          )}
                        </span>
                        <span
                          className="mt-0.5 block truncate text-xs text-neutral-600"
                          title={path}
                        >
                          {path}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`${group.name} 링크 복사`}
                        className={SECONDARY_BUTTON}
                        disabled={busy}
                        onClick={() => void copyGroupLink(group)}
                      >
                        {copiedFolderId === group.folderId ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          <Copy size={16} aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="sr-only" role="status">
                {copiedFolderId &&
                  `${groupOptions.find(group => group.folderId === copiedFolderId)?.name ?? ''} 링크를 복사했어요.`}
              </p>
            </section>

            <form
              noValidate
              onSubmit={submitGroup}
              onKeyDown={event => {
                if (event.key === 'Enter' && event.nativeEvent.isComposing) {
                  event.preventDefault();
                }
              }}
              aria-labelledby={newGroupId}
              className="grid gap-3 rounded-xl border border-[#deddd6] bg-[#f7f6f3] p-4"
            >
              <div>
                <h3 id={newGroupId} className="text-sm font-semibold">
                  새 하객 그룹
                </h3>
                <p className="mt-1 text-xs text-neutral-600">
                  초대장의 디자인과 모든 내용을 복제해요.
                </p>
              </div>
              <fieldset
                disabled={busy || Boolean(pendingAction)}
                className="grid min-w-0 gap-3"
              >
                {groupOptions.length > 1 && (
                  <label className="grid gap-1.5 text-xs font-semibold">
                    복제할 초대장
                    <select
                      value={source?.folderId ?? ''}
                      onChange={event => setSourceFolderId(event.target.value)}
                      className={FIELD_CLASS}
                    >
                      {groupOptions.map(group => (
                        <option key={group.folderId} value={group.folderId}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-semibold">
                    대상 이름
                    <input
                      ref={nameRef}
                      value={name}
                      onChange={event => {
                        setName(event.target.value);
                        setError(null);
                      }}
                      className={FIELD_CLASS}
                      placeholder="가족"
                      autoComplete="off"
                      maxLength={MAX_AUDIENCE_NAME_LENGTH}
                      required
                      aria-invalid={error?.field === 'name' || undefined}
                      aria-describedby={
                        error?.field === 'name' ? errorId : undefined
                      }
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold">
                    링크 영문명
                    <input
                      ref={slugRef}
                      value={slug}
                      onChange={event => {
                        setSlug(event.target.value);
                        setError(null);
                      }}
                      className={FIELD_CLASS}
                      placeholder="family"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={MAX_AUDIENCE_SLUG_LENGTH}
                      required
                      aria-invalid={error?.field === 'slug' || undefined}
                      aria-describedby={
                        error?.field === 'slug'
                          ? `${slugHelpId} ${errorId}`
                          : slugHelpId
                      }
                    />
                  </label>
                </div>
                <p id={slugHelpId} className="text-xs text-neutral-600">
                  영문 소문자로 시작하고 숫자와 하이픈도 쓸 수 있어요.
                </p>
                <div className="flex min-w-0 items-end justify-between gap-3">
                  <label className="grid min-w-0 gap-1 text-xs text-neutral-600">
                    링크 예시
                    <output className="break-all font-medium text-text-primary">
                      {example}
                    </output>
                  </label>
                  <button className={PRIMARY_BUTTON} type="submit">
                    <Plus size={16} aria-hidden="true" />
                    추가
                  </button>
                </div>
              </fieldset>
            </form>
          </>
        )}

        {pendingAction && (
          <section
            aria-label="변경 사항 저장"
            className="grid gap-3 rounded-xl border border-[#deddd6] bg-white p-4"
          >
            <p className="text-sm leading-6">
              저장하지 않은 변경 사항이 있어요. 현재 초대장을 저장한 뒤
              계속할까요?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                ref={confirmationCancelRef}
                type="button"
                className={SECONDARY_BUTTON}
                disabled={busy}
                onClick={() => {
                  setPendingAction(null);
                  setError(null);
                }}
              >
                취소
              </button>
              <button
                type="button"
                className={PRIMARY_BUTTON}
                disabled={busy}
                onClick={() => void continueAction(pendingAction)}
              >
                저장 후 계속
              </button>
            </div>
          </section>
        )}
        {operationMessage && (
          <p role="status" className="text-sm text-neutral-600">
            {operationMessage}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-sm text-[#a3212d]">
            {error.message}
          </p>
        )}
      </section>
    </dialog>,
    document.body
  );
}
