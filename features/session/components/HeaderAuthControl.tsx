'use client';

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
        className="ml-4 w-10 h-10 bg-transparent rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-neutral-50 transition-colors disabled:opacity-50"
      />
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
