'use client';

import { forwardRef, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import { cn } from '@/shared/utils/cn';
import {
  trapFocus,
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
} from '@/shared/utils/focusTrap';

import { confirmPositionVariants, confirmVariants } from './Confirm.style';

type ConfirmProps = {
  message: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  variant?: 'white' | 'glass';
  xPosition?: 'left' | 'center' | 'right';
  yPosition?: 'top' | 'center' | 'bottom';
  confirmTone?: 'danger' | 'neutral';
  actionButtonClassName?: string;
  initialFocus?: 'dialog' | 'cancel';
  isBusy?: boolean;
  errorMessage?: string | null;
};

const Confirm = forwardRef<HTMLDivElement, ConfirmProps>(
  (
    {
      message,
      description,
      confirmText = '예',
      cancelText = '아니오',
      onConfirm,
      onCancel,
      onClose,
      variant = 'glass',
      xPosition = 'center',
      yPosition = 'top',
      confirmTone = 'danger',
      actionButtonClassName,
      initialFocus = 'dialog',
      isBusy = false,
      errorMessage,
    }: ConfirmProps,
    ref
  ) => {
    const backdropDismiss = useBackdropDismiss<HTMLDivElement>(
      isBusy ? undefined : onClose
    );
    const messageId = useId();
    const descriptionId = useId();
    const errorId = useId();
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const buttonClassName = cn(
      'text-[13px] rounded-lg w-[66px] h-8 hover:bg-[#FFE8E8]/32 cursor-pointer aria-disabled:cursor-wait aria-disabled:opacity-60',
      actionButtonClassName
    );

    useEffect(() => {
      if (errorMessage) confirmButtonRef.current?.focus();
    }, [errorMessage]);

    useEffect(() => {
      const previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const enableRestore = disableBodyScroll();
      getHiddenRoot();

      // 포커스를 모달로 이동
      const timer = setTimeout(() => {
        if (initialFocus === 'cancel') {
          cancelButtonRef.current?.focus();
        } else if (ref && 'current' in ref) {
          ref.current?.focus();
        }
      }, 0);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
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
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
      };
    }, [initialFocus, onClose, ref]);

    return createPortal(
      <div
        className={confirmPositionVariants({ xPosition, yPosition })}
        {...backdropDismiss}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={messageId}
          aria-describedby={
            [description && descriptionId, errorMessage && errorId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
          className={cn(confirmVariants({ variant }), 'max-w-[calc(100%_-_2rem)]')}
        >
          <div>
            <p
              id={messageId}
              className="whitespace-pre-wrap break-words text-center text-sm font-semibold text-text-primary font-pretendard"
            >
              {message}
            </p>
            {description && (
              <p
                id={descriptionId}
                className="mt-2 text-center text-sm text-text-primary font-pretendard"
              >
                {description}
              </p>
            )}
          </div>
          {errorMessage && (
            <p
              id={errorId}
              role="alert"
              className="text-center text-sm text-status-error font-pretendard"
            >
              {errorMessage}
            </p>
          )}
          <div className="flex items-center justify-center gap-5">
            <button
              ref={confirmButtonRef}
              type="button"
              aria-disabled={isBusy || undefined}
              className={cn(
                buttonClassName,
                confirmTone === 'danger'
                  ? 'text-status-error'
                  : 'text-text-primary'
              )}
              onClick={isBusy ? undefined : onConfirm}
            >
              {confirmText}
            </button>
            <button
              ref={cancelButtonRef}
              type="button"
              aria-disabled={isBusy || undefined}
              className={cn(buttonClassName, 'text-text-primary')}
              onClick={isBusy ? undefined : onCancel}
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
