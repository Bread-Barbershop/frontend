'use client';

import { motion } from 'framer-motion';
import React, { forwardRef, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import {
  trapFocus,
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
} from '@/shared/utils/focusTrap';

interface DeleteModalProps {
  setIsDeleteModal: (isDeleteModal: boolean) => void;
  onDelete: () => void;
}

const emptySubscribe = () => () => {};

const DeleteModal = forwardRef<HTMLDivElement, DeleteModalProps>(
  ({ setIsDeleteModal, onDelete }: DeleteModalProps, ref) => {
    const mounted = useSyncExternalStore(
      emptySubscribe,
      () => true,
      () => false
    );

    useEffect(() => {
      const enableRestore = disableBodyScroll();
      getHiddenRoot();

      const timer = setTimeout(() => {
        if (ref && 'current' in ref && ref.current) {
          ref.current.focus();
        }
      }, 0);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsDeleteModal(false);
        }
        if (ref && 'current' in ref && ref.current) {
          trapFocus(e, ref.current);
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        enableRestore();
        removeHiddenRoot();
      };
    }, [setIsDeleteModal, ref]);

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/30"
        onClick={() => setIsDeleteModal(false)}
      >
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="flex flex-col gap-5 px-5 w-57 box-border border border-black/5 bg-white rounded-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18)]"
        >
          <div className="pt-5">
            <p
              id="delete-modal-title"
              className="w-full text-sm font-semibold text-text-primary font-pretendard text-center"
            >
              해당 페이지를 삭제하시겠습니까?
            </p>
          </div>
          <div className="flex items-center justify-center gap-5 mb-3">
            <button
              type="button"
              className="text-[13px] text-status-error rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer transition-colors"
              onClick={onDelete}
            >
              예
            </button>
            <button
              type="button"
              className="text-[13px] text-text-primary rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer transition-colors"
              onClick={() => setIsDeleteModal(false)}
            >
              아니오
            </button>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    );
  }
);

DeleteModal.displayName = 'DeleteModal';

export default DeleteModal;
