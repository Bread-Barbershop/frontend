'use client';

import Image from 'next/image';

import inviaLogo from '@/shared/assets/logo/Invia-logo.png';

interface LoginModalProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

function LoginModal({
  open,
  isLoading,
  onClose,
  onGoogleLogin,
}: LoginModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[rgb(0_0_0_/_8%)]" />

      <div
        className="relative w-98 rounded-xl border border-white/22 bg-white/72 p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%),0_1px_8px_-2px_rgb(255_255_255_/_35%)] backdrop-blur-xl flex flex-col items-center gap-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex h-27.25 w-56 items-center justify-center">
          <Image
            src={inviaLogo}
            alt="Invia"
            width={4096}
            height={821}
            className="h-7.25 w-auto"
            priority
          />
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="relative flex h-11 w-full items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-2 py-1.5 text-[15px] font-medium text-[#111827] enabled:hover:bg-[#FAFAFB] enabled:active:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <Image
            src="/assets/icons/google-icon.svg"
            alt="Google"
            width={32}
            height={32}
            className="absolute left-2"
          />
          <p>{isLoading ? '로그인중..' : 'Google로 계속하기'}</p>
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
