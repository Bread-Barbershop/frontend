'use client';

import Image from 'next/image';

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
      <div
        className="w-98 rounded-xl border border-white/20 bg-white/15 p-5 shadow-xl backdrop-blur-lg flex flex-col items-center gap-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-24.25 w-36 flex items-center justify-center">
          브랜드 로고
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[15px] font-medium text-[#111827] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <Image
            src="/assets/icons/google-icon.svg"
            alt="Google"
            width={32}
            height={32}
          />
          <p>{isLoading ? '로그인중..' : 'Google로 계속하기'}</p>
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
