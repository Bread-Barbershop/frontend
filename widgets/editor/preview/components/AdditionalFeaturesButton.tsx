'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  DEFAULT_INVITATION_PRIVACY,
  INVITATION_PRIVACY_FIELDS,
  type InvitationPrivacy,
} from '@/features/invitation/privacy/settings';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';
import { parseStrictDate } from '@/shared/utils/dateValidation';

const checkboxClassName =
  'size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function InvitationSettingsModal({
  initialIsZoom,
  initialPrivacy,
  onClose,
}: {
  initialIsZoom: boolean;
  initialPrivacy: InvitationPrivacy;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const optionsId = useId();
  const [draftIsZoom, setDraftIsZoom] = useState(initialIsZoom);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [expanded, setExpanded] = useState(false);
  const missingFields = privacy.enabled && !privacy.fields.length;
  const optionsOpen = privacy.enabled && expanded;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    checkboxRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(440px,calc(100vw-32px))] overflow-y-auto rounded-2xl bg-white p-0 text-text-primary shadow-edit backdrop:bg-black/50"
    >
      <form
        className="flex flex-col gap-5 p-6"
        onSubmit={event => {
          event.preventDefault();
          if (
            privacy.enabled &&
            (!parseStrictDate(privacy.eventDate) || missingFields)
          )
            return;
          // 두 설정을 한 번에 반영하고, 취소한 변경은 저장하지 않는다.
          useEditorStore.setState({
            isZoom: draftIsZoom,
            invitationPrivacy: privacy,
          });
          onClose();
        }}
      >
        <h2 id={titleId} className="text-base font-semibold">
          초대장 설정
        </h2>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={draftIsZoom}
            onChange={event => setDraftIsZoom(event.target.checked)}
            className={checkboxClassName}
          />
          <span>초대장 확대 방지</span>
        </label>
        <div className="border-t border-black/10 pt-4">
          <div className="flex items-center gap-2">
            <label className="flex min-h-11 flex-1 cursor-pointer items-start gap-3 py-1.5 text-sm">
              <input
                type="checkbox"
                className={cn(checkboxClassName, 'mt-0.5')}
                checked={privacy.enabled}
                onChange={event => {
                  const enabled = event.target.checked;
                  setPrivacy(previous => ({ ...previous, enabled }));
                  if (enabled) setExpanded(true);
                }}
              />
              <span>
                <span className="block font-medium">
                  행사일이 지나면 개인정보 가리기
                </span>
                <span className="block text-xs text-text-secondary">
                  행사 다음 날 00:00부터 · 한국 시간 기준
                </span>
              </span>
            </label>
            {privacy.enabled && (
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-black/10 hover:bg-neutral-50"
                aria-label={
                  optionsOpen ? '가릴 정보 옵션 접기' : '가릴 정보 옵션 펼치기'
                }
                aria-expanded={optionsOpen}
                aria-controls={optionsId}
                onClick={() => setExpanded(previous => !previous)}
              >
                <ChevronDown
                  aria-hidden="true"
                  size={18}
                  className={cn(
                    'transition-transform motion-reduce:transition-none',
                    optionsOpen && 'rotate-180'
                  )}
                />
              </button>
            )}
          </div>
          <div
            id={optionsId}
            aria-hidden={!optionsOpen}
            inert={!optionsOpen}
            className={cn(
              'grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none',
              optionsOpen
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="ml-1.5 mt-3 space-y-4 border-l border-black/10 pl-4">
                <label className="flex flex-col items-start gap-1 text-sm">
                  <span>행사일</span>
                  <input
                    type="date"
                    className="min-h-10 w-full rounded-md border border-black/15 px-2"
                    value={privacy.eventDate}
                    onChange={event => {
                      const eventDate = event.target.value;
                      setPrivacy(previous => ({ ...previous, eventDate }));
                    }}
                  />
                </label>
                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm font-medium">
                    가릴 정보
                  </legend>
                  {INVITATION_PRIVACY_FIELDS.map(
                    ({ key, label, description }) => (
                      <label
                        key={key}
                        className="flex min-h-11 cursor-pointer gap-2.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          className={cn(checkboxClassName, 'mt-0.5')}
                          checked={privacy.fields.includes(key)}
                          onChange={event => {
                            const checked = event.target.checked;
                            setPrivacy(previous => ({
                              ...previous,
                              fields: checked
                                ? [...previous.fields, key]
                                : previous.fields.filter(
                                    field => field !== key
                                  ),
                            }));
                          }}
                        />
                        <span>
                          <span className="block">{label}</span>
                          <span className="block text-xs text-text-secondary">
                            {description}
                          </span>
                        </span>
                      </label>
                    )
                  )}
                </fieldset>
                <p className="text-xs leading-relaxed text-text-secondary">
                  이미지 속 정보도 가리려면 사진·영상과 메인 포스터를 선택해
                  주세요. 직접 입력한 문구와 공개 Drive 원본 링크의 공유 권한은
                  따로 관리해 주세요.
                </p>
              </div>
            </div>
          </div>
          {privacy.enabled && !parseStrictDate(privacy.eventDate) && (
            <p className="mt-2 text-xs text-red-700">
              가리기를 시작할 기준 행사일을 입력해 주세요.
            </p>
          )}
          {missingFields && (
            <p className="mt-2 text-xs text-red-700">
              가릴 정보를 하나 이상 선택해 주세요.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="h-10 rounded-lg border border-black/10 px-4 text-sm font-semibold transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={
              privacy.enabled &&
              (!parseStrictDate(privacy.eventDate) || missingFields)
            }
            className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
          >
            적용
          </button>
        </div>
      </form>
    </dialog>,
    document.body
  );
}

export default function InvitationSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const isZoom = useEditorStore(state => state.isZoom);
  const privacy = useEditorStore(state => state.invitationPrivacy);

  function getInitialPrivacy(): InvitationPrivacy {
    if (privacy?.eventDate) return privacy;
    const blocks = useEditorStore.getState().block;
    const calendar = blocks.find(
      (block): block is EditorBlock<'calendar'> =>
        block.component === 'calendar'
    );
    const countdown = blocks.find(
      (block): block is EditorBlock<'countdown'> =>
        block.component === 'countdown'
    );
    const eventDate = [
      calendar?.props.date,
      countdown?.props.eventDateTime?.slice(0, 10),
    ].find(
      (date): date is string =>
        typeof date === 'string' && Boolean(parseStrictDate(date))
    );
    return {
      ...(privacy ?? DEFAULT_INVITATION_PRIVACY),
      eventDate: eventDate ?? '',
    };
  }

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        초대장 설정
      </button>
      {isOpen && (
        <InvitationSettingsModal
          initialIsZoom={isZoom}
          initialPrivacy={getInitialPrivacy()}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
