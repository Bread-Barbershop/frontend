'use client';

import { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/utils/cn';
import { trapFocus, disableBodyScroll, getHiddenRoot, removeHiddenRoot } from '@/shared/utils/focusTrap';

import { confirmPositionVariants, confirmVariants } from './Confirm.style';

type ConfirmProps = {
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  variant?: 'white' | 'glass';
  xPosition?: 'left' | 'center' | 'right';
  yPosition?: 'top' | 'center' | 'bottom';
};

const Confirm = forwardRef<HTMLDivElement, ConfirmProps>(
  (
    {
      message,
      confirmText = '예',
      cancelText = '아니오',
      onConfirm,
      onCancel,
      onClose,
      variant = 'glass',
      xPosition = 'center',
      yPosition = 'top',
    }: ConfirmProps,
    ref
  ) => {
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
          onClose();
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
    }, [onClose, ref]);

    return createPortal(
      <div
        className={confirmPositionVariants({ xPosition, yPosition })}
        onClick={onClose}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-message"
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
          className={cn(confirmVariants({ variant }))}
        >
          <div>
            <p id="confirm-message" className="whitespace-pre text-center text-sm font-semibold text-text-primary font-pretendard">
              {message}
            </p>
          </div>
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              className="text-[13px] text-status-error rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer focus:outline-none focus:ring-2 focus:ring-status-error focus:ring-offset-2"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="text-[13px] text-text-primary rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

Confirm.displayName = 'Confirm';

export default Confirm;
