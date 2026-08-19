import React, { forwardRef, useEffect } from 'react';
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

const DeleteModal = forwardRef<HTMLDivElement, DeleteModalProps>(
  ({ setIsDeleteModal, onDelete }: DeleteModalProps, ref) => {
    useEffect(() => {
      const enableRestore = disableBodyScroll();
      getHiddenRoot();

      // 포커스를 모달로 이동
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

    return createPortal(
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/30">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          tabIndex={-1}
          className="flex flex-col gap-5 px-5 w-57 box-border border border-black/5 bg-white rounded-xl
      shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18)]
      "
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
              className="text-[13px] text-status-error rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32"
              onClick={onDelete}
            >
              예
            </button>
            <button
              type="button"
              className="text-[13px] text-text-primary rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32"
              onClick={() => setIsDeleteModal(false)}
            >
              아니오
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

DeleteModal.displayName = 'DeleteModal';

export default DeleteModal;
