'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

function AdditionalFeaturesModal({
  initialIsZoom,
  onClose,
}: {
  initialIsZoom: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [draftIsZoom, setDraftIsZoom] = useState(initialIsZoom);
  const setIsZoom = useEditorStore(state => state.setIsZoom);

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
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(400px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-white p-0 text-text-primary shadow-edit backdrop:bg-black/50"
    >
      <section className="flex flex-col gap-6 p-6">
        <h2 id={titleId} className="text-base font-semibold">
          추가 기능
        </h2>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={draftIsZoom}
            onChange={event => setDraftIsZoom(event.target.checked)}
            className="size-4 shrink-0 accent-black focus:outline-2 focus:outline-offset-2 focus:outline-black"
          />
          <span>초대장 확대 방지</span>
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="h-10 rounded-lg border border-black/10 px-4 text-sm font-semibold transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              setIsZoom(draftIsZoom);
              onClose();
            }}
          >
            적용
          </button>
        </div>
      </section>
    </dialog>,
    document.body
  );
}

export default function AdditionalFeaturesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const isZoom = useEditorStore(state => state.isZoom);

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
        추가 기능
      </button>
      {isOpen && (
        <AdditionalFeaturesModal
          initialIsZoom={isZoom}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
