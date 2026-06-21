'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import InviaSimpleLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';
import {
  trapFocus,
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
} from '@/shared/utils/focusTrap';

type DrivePermissionRequiredModalProps = {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onRetry: () => void;
};

const FADE_OUT_MS = 180;

function DrivePermissionRequiredModal({
  open,
  isLoading,
  onClose,
  onRetry,
}: DrivePermissionRequiredModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  const closeWithFade = useCallback(() => {
    if (isClosing || isLoading) return;

    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, FADE_OUT_MS);
  }, [isClosing, isLoading, onClose]);

  useEffect(() => {
    if (!open || isClosing) return;

    const enableRestore = disableBodyScroll();
    getHiddenRoot();

    const timer = setTimeout(() => {
      retryButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWithFade();
      }
      if (modalRef.current) {
        trapFocus(e, modalRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      enableRestore();
      removeHiddenRoot();
    };
  }, [open, isClosing, closeWithFade]);

  if (!open && !isClosing) return null;

  return createPortal(
    <div
      ref={modalRef}
      className={`fixed inset-0 z-9999 flex items-center justify-center transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'animate-[fade-in_180ms_ease-out] opacity-100'
      }`}
      onClick={closeWithFade}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-permission-title"
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-[rgb(0_0_0_/_8%)]" />

      <div
        className={`relative flex w-[min(392px,calc(100vw-40px))] flex-col items-center gap-5 rounded-xl border border-white/22 bg-white/72 p-5 text-center shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%),0_1px_8px_-2px_rgb(255_255_255_/_35%)] backdrop-blur-xl transition-all duration-200 ${
          isClosing
            ? 'scale-[0.98] opacity-0'
            : 'animate-[fade-in_180ms_ease-out] scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={InviaSimpleLogo3d}
          alt="Invia"
          width={92}
          height={92}
          className="block h-[92px] w-[92px] shrink-0"
          priority
        />

        <div className="flex flex-col gap-2">
          <h2
            id="drive-permission-title"
            className="text-[20px] font-bold leading-7 text-text-plain"
          >
            Google Drive 권한이 필요해요
          </h2>
          <p className="text-[14px] font-medium leading-5 text-[#4b5563]">
            초대장을 저장하려면 Drive 권한이 필요합니다.
            <br />
            다음 Google 화면에서 확인을 눌러 주세요.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <button
            ref={retryButtonRef}
            type="button"
            onClick={onRetry}
            disabled={isLoading}
            className="h-11 w-full cursor-pointer rounded-lg bg-bg-plain px-4 text-[15px] font-semibold text-white transition-colors enabled:hover:bg-[#202020] enabled:active:bg-[#0D0D0D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '권한 요청 중...' : '다시 권한 허용하기'}
          </button>
          <button
            type="button"
            onClick={closeWithFade}
            disabled={isLoading}
            className="h-10 w-full cursor-pointer rounded-lg text-[14px] font-medium text-[#4b5563] transition-colors enabled:hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DrivePermissionRequiredModal;
