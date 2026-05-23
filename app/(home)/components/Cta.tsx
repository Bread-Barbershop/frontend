'use client';

import { useRouter } from 'next/navigation';

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
    closeLogin,
    closePrivacyNotice,
    loginWithGoogle,
    runAfterAuth,
  } = useAuthGate({ initialIsLoggedIn });

  const handleStart = () => {
    runAfterAuth(() => {
      router.push('/editor');
    });
  };

  return (
    <>
      <section className="flex flex-col gap-10 border-none">
        <div
          className="
          inline-flex w-fit flex-col gap-2 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <p className="text-2xl font-medium text-[#121212] select-none">
            Signature Invitation
          </p>

          <h1 className="text-[64px] font-black leading-tight text-[#121212] select-none whitespace-nowrap">
            우리의 이야기
            <br />첫 시작은 초대장으로.
          </h1>

          <p className="text-2xl font-medium text-[#121212] select-none whitespace-nowrap">
            폰트·컬러·레이아웃까지, 우리만의 시그니처로 마무리해요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={isBusy}
          className="
          flex h-13.25 w-53.5 items-center justify-center rounded-full
          bg-[#121212] text-2xl font-medium text-white
          transition-all hover:bg-[#202020] active:scale-95 active:bg-[#0D0D0D] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
        "
        >
          무료로 제작하기
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
      />
    </>
  );
}

export default Cta;
