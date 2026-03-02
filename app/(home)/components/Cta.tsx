'use client';

import { useRouter } from 'next/navigation';

import LoginModal from '@/app/(home)/components/LoginModal';
import { useAuthGate } from '@/app/(home)/components/useAuthGate';
import { cn } from '@/shared/utils/cn';

type CtaProps = {
  initialIsLoggedIn: boolean;
  isShowcaseHovered?: boolean;
};

function Cta({ initialIsLoggedIn, isShowcaseHovered = false }: CtaProps) {
  const router = useRouter();
  const {
    isBusy,
    isLoginOpen,
    isLoginPending,
    closeLogin,
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
      <section className="absolute left-10 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-10 border-none">
        <div
          className="
          flex w-185 flex-col gap-2 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30 
          shadow-2xl 
          supports-backdrop-filter:bg-white/6
        "
        >
          <p className="text-2xl font-medium text-[#121212] select-none">
            Signature Invitation
          </p>

          <h1
            data-showcase-hovered={isShowcaseHovered ? 'true' : 'false'}
            className={cn(
              'text-[64px] font-black leading-tight select-none',
              isShowcaseHovered
                ? 'text-white [text-shadow:0_4px_16px_rgba(0,0,0,0.28)]'
                : 'text-[#121212]'
            )}
          >
            우리의 이야기 첫 시작은
            <br />
            초대장으로.
          </h1>

          <p
            data-showcase-hovered={isShowcaseHovered ? 'true' : 'false'}
            className={cn(
              'text-2xl font-medium select-none',
              isShowcaseHovered
                ? 'text-white [text-shadow:0_4px_16px_rgba(0,0,0,0.28)]'
                : 'text-[#121212]'
            )}
          >
            폰트·컬러·레이아웃까지, 우리만의 시그니처로 마무리해요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={isBusy}
          className="
          flex h-13.25 w-43.25 items-center justify-center rounded-full 
          bg-[#121212] text-2xl font-medium text-white 
          transition-all hover:bg-[#202020] active:scale-95 active:bg-[#0D0D0D] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
        "
        >
          만들러 가기
        </button>
      </section>
      <LoginModal
        open={isLoginOpen}
        isLoading={isLoginPending}
        onClose={closeLogin}
        onGoogleLogin={loginWithGoogle}
      />
    </>
  );
}

export default Cta;
