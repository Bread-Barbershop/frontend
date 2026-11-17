'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import InviaSimpleLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';
import { AUTH_SESSION_MAX_AGE_DAYS } from '@/shared/config/authSession';
import {
  trapFocus,
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
} from '@/shared/utils/focusTrap';

interface LoginModalProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

const FADE_OUT_MS = 180;

function LoginModal({
  open,
  isLoading,
  onClose,
  onGoogleLogin,
}: LoginModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLButtonElement>(null);

  const closeWithFade = () => {
    if (isClosing) return;

    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, FADE_OUT_MS);
  };

  useEffect(() => {
    if (!open || isClosing) return;

    const enableRestore = disableBodyScroll();
    getHiddenRoot();

    // 포커스를 Google 버튼으로 이동
    const timer = setTimeout(() => {
      googleButtonRef.current?.focus();
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
  }, [open, isClosing]);

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
      aria-labelledby="login-modal-title"
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-[rgb(0_0_0_/_8%)]" />

      <div
        className={`relative flex max-h-[calc(100dvh-40px)] w-[392px] max-w-[calc(100vw-40px)] flex-col items-center gap-5 overflow-y-auto rounded-[12px] bg-white p-5 ring-1 ring-white/22 ring-inset transition-all duration-200 ${
          isClosing
            ? 'scale-[0.98] opacity-0'
            : 'animate-[fade-in_180ms_ease-out] scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={InviaSimpleLogo3d}
          alt="Invia"
          width={120}
          height={120}
          className="block h-[120px] w-[120px] shrink-0"
          priority
        />

        <div className="w-full text-left">
          <h2 id="login-modal-title" className="text-lg font-semibold">
            Google Drive 연결
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            초대장을 저장·수정·삭제하고 공개 상태를 관리하기 위해 Google 계정을
            연결해요. 계정 연결에 필요한 인증 정보는 암호화해 최대{' '}
            {AUTH_SESSION_MAX_AGE_DAYS}일간 보관하며, 로그아웃하면 해당 로그인
            정보를 삭제해요.
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            아래 버튼을 누르면 이 인증 정보 처리에 동의하고 Google의 권한 확인
            화면으로 이동해요. Google 권한 해제는 로그아웃과 별개예요.
          </p>
          <Link
            href="/policy#google-user-data"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm underline underline-offset-4"
          >
            개인정보처리방침 및 연결 해제 방법
          </Link>
        </div>

        <button
          ref={googleButtonRef}
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="relative flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-white py-1.5 pl-11 pr-3 text-[14px] font-medium text-[#111827] ring-1 ring-[#EBEBEB] ring-inset enabled:hover:bg-[#FAFAFB] enabled:active:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Image
            src="/assets/icons/google-icon.svg"
            alt="Google"
            width={32}
            height={32}
            className="absolute left-2"
          />
          <p>{isLoading ? '로그인중..' : '동의하고 Google로 계속하기'}</p>
        </button>
        <button
          type="button"
          onClick={closeWithFade}
          className="text-sm text-text-secondary underline underline-offset-4"
        >
          취소
        </button>
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
