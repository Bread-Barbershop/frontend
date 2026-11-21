'use client';

import { useRouter } from 'next/navigation';

import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';

type CtaProps = {
  initialIsLoggedIn: boolean;
};

function Cta({ initialIsLoggedIn }: CtaProps) {
  const router = useRouter();
  const {
    isBusy,
    isLoginOpen,
    isLoginPending,
    isPrivacyNoticeOpen,
    isDrivePermissionRequiredOpen,
    closeLogin,
    closePrivacyNotice,
    confirmPrivacyNotice,
    closeDrivePermissionRequired,
    loginWithGoogle,
    retryDrivePermission,
    runAfterAuth,
  } = useAuthGate({ initialIsLoggedIn });

  const handleStart = () => {
    runAfterAuth(() => {
      router.push('/editor');
    });
  };

  return (
    <>
      {/* At the 1920px design width, 1em is 16px. CSS sizes the first paint too. */}
      <section className="flex flex-col gap-[2.5em] text-[length:min(1rem,calc(100vw/120))]">
        <div
          className="
          inline-flex w-fit flex-col gap-[0.5em] rounded-[2em] p-[2em]
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <p className="text-[1.5em] leading-[1.333333] font-medium text-text-plain select-none">
            Signature Invitation
          </p>

          <h1 className="text-[4em] font-black leading-tight text-text-plain select-none whitespace-nowrap">
            우리의 이야기
            <br />첫 시작은 초대장으로.
          </h1>

          <p className="text-[1.5em] leading-[1.333333] font-medium text-text-plain select-none whitespace-nowrap">
            폰트·컬러·레이아웃까지, 우리만의 시그니처로 마무리해요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={isBusy}
          className="
          flex h-[3.3125em] w-[13.375em] items-center justify-center rounded-full
          bg-bg-plain font-medium text-white
          transition-[background-color,scale] hover:bg-[#202020] active:scale-95 active:bg-[#0D0D0D] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
        "
        >
          <span className="text-[1.5em] leading-[1.333333]">
            무료로 제작하기
          </span>
        </button>
      </section>
      <LoginModal
        open={isLoginOpen}
        isLoading={isLoginPending}
        onClose={closeLogin}
        onGoogleLogin={loginWithGoogle}
      />
      <PrivacyNoticeModal
        open={isPrivacyNoticeOpen}
        onClose={closePrivacyNotice}
        onConfirm={confirmPrivacyNotice}
      />
      <DrivePermissionRequiredModal
        open={isDrivePermissionRequiredOpen}
        isLoading={isLoginPending}
        onClose={closeDrivePermissionRequired}
        onRetry={retryDrivePermission}
      />
    </>
  );
}

export default Cta;
