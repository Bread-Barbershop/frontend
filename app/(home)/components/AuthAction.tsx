'use client';

import LoginModal from '@/app/(home)/components/LoginModal';
import { useAuthGate } from '@/app/(home)/components/useAuthGate';

type AuthActionProps = {
  initialIsLoggedIn: boolean;
};

function AuthAction({ initialIsLoggedIn }: AuthActionProps) {
  const {
    isLoggedIn,
    isBusy,
    isLoginOpen,
    isLoginPending,
    login,
    closeLogin,
    loginWithGoogle,
    logout,
  } = useAuthGate({ initialIsLoggedIn });

  if (isLoggedIn) {
    return (
      <div className="ml-4 flex items-center gap-3">
        <button
          type="button"
          onClick={logout}
          disabled={isBusy}
          className="h-10 rounded-full border border-[#d9d9d9] px-4 text-sm text-text-secondary hover:text-black hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={login}
        disabled={isBusy}
        aria-label="Google login"
        className="ml-4 w-10 h-10 bg-transparent rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-neutral-50 transition-colors disabled:opacity-50"
      />
      <LoginModal
        open={isLoginOpen}
        isLoading={isLoginPending}
        onClose={closeLogin}
        onGoogleLogin={loginWithGoogle}
      />
    </>
  );
}

export default AuthAction;
