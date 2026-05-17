'use client';

import { CircleUserRound } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { useConfirm } from '@/shared/hooks/useConfirm';

import LoginModal from './LoginModal';

type HeaderAuthControlProps = {
  initialIsLoggedIn: boolean;
};

function HeaderAuthControl({ initialIsLoggedIn }: HeaderAuthControlProps) {
  const router = useRouter();
  const {
    isLoggedIn,
    isBusy,
    isLoginOpen,
    isLoginPending,
    login,
    closeLogin,
    loginWithGoogle,
    logout,
    runAfterAuth,
  } = useAuthGate({ initialIsLoggedIn });
  const pathname = usePathname();
  const { confirm } = useConfirm();

  const handleDashboardClick = async (e: React.MouseEvent) => {
    if (pathname.startsWith('/editor')) {
      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
      });
      if (!isConfirm) {
        e.preventDefault();
        return;
      }
      runAfterAuth(() => router.push('/dashboard'));
    } else {
      runAfterAuth(() => router.push('/dashboard'));
    }
  };

  if (isLoggedIn) {
    return (
      <>
        <button
          type="button"
          onClick={logout}
          disabled={isBusy}
          className="text-text-secondary h-full px-8 flex items-center text-[14px] font-semibold hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
        >
          LOGOUT
        </button>
        <button
          type="button"
          onClick={handleDashboardClick}
          disabled={isBusy}
          aria-label="Go to dashboard"
          className="ml-4 flex h-10 w-10 items-center justify-center bg-transparent cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <CircleUserRound size={40} strokeWidth={1.2} color="#838383" />
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={login}
        disabled={isBusy}
        className="text-text-secondary h-full px-8 flex items-center text-[16px] font-semibold hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
      >
        LOGIN
      </button>
      <LoginModal
        open={isLoginOpen}
        isLoading={isLoginPending}
        onClose={closeLogin}
        onGoogleLogin={loginWithGoogle}
      />
    </>
  );
}

export default HeaderAuthControl;
