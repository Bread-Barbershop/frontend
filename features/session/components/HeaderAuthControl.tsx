'use client';

import { CircleUserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuthGate } from '@/features/session/hooks/useAuthGate';

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
    runAfterAuth,
  } = useAuthGate({ initialIsLoggedIn });

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => runAfterAuth(() => router.push('/dashboard'))}
        disabled={isBusy}
        aria-label="Go to dashboard"
        className="ml-4 flex h-10 w-10 items-center justify-center bg-transparent cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        <CircleUserRound size={40} strokeWidth={1.2} color="#838383" />
      </button>
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
