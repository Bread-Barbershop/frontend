import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';

interface DeleteModalProps {
  setIsDeleteModal: (isDeleteModal: boolean) => void;
  onDelete: () => void;
}

const DeleteModal = forwardRef<HTMLDivElement, DeleteModalProps>(
  ({ setIsDeleteModal, onDelete }: DeleteModalProps, ref) => {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          ref={ref}
          className="flex flex-col gap-5 px-5 w-57 box-border border border-white/22 rounded-xl 
      shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18),0_1px_8px_-2px_rgba(255,255,255,0.35)] backdrop-blur-2xl
      bg-[linear-gradient(rgba(255,255,255,0.18)_0%,transparent_30%),rgba(255,255,255,0.12)]
      "
        >
          <div className="pt-5">
            <p className="w-full text-sm font-semibold text-text-primary font-pretendard text-center">
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
