'use client';

import { forwardRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/utils/cn';

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
    return createPortal(
      <div
        className={cn(confirmPositionVariants({ xPosition, yPosition }))}
        onClick={onClose}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={message}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Escape') onClose();
          }}
          className={cn(confirmVariants({ variant }))}
        >
          <div>
            <p className="whitespace-pre text-center text-sm font-semibold text-text-primary font-pretendard">
              {message}
            </p>
          </div>
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              className="text-[13px] text-status-error rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="text-[13px] text-text-primary rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer"
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
