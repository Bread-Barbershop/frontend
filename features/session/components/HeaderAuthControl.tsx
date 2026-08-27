'use client';

import { usePathname, useRouter } from 'next/navigation';

import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import DrivePermissionRequiredModal from './DrivePermissionRequiredModal';
import LoginModal from './LoginModal';
import PrivacyNoticeModal from './PrivacyNoticeModal';

import type { MouseEvent } from 'react';

type HeaderAuthControlProps = {
  initialIsLoggedIn: boolean;
};

const HEADER_ACTION_CLASS =
  'flex items-center border-b border-transparent px-2 py-[6.5px] text-[16px] font-semibold text-text-plain transition-colors enabled:hover:border-black enabled:hover:text-black disabled:opacity-50 cursor-pointer';

function HeaderAuthControl({ initialIsLoggedIn }: HeaderAuthControlProps) {
  const router = useRouter();
  const {
    isLoggedIn,
    isBusy,
    isLoginOpen,
    isLoginPending,
    isPrivacyNoticeOpen,
    isDrivePermissionRequiredOpen,
    login,
    closeLogin,
    closePrivacyNotice,
    closeDrivePermissionRequired,
    loginWithGoogle,
    retryDrivePermission,
    logout,
    runAfterAuth,
  } = useAuthGate({ initialIsLoggedIn });
  const pathname = usePathname();
  const { confirm } = useConfirm();
  const isDirty = useEditorStore(state => state.isDirty);
  const modals = (
    <>
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
      <DrivePermissionRequiredModal
        open={isDrivePermissionRequiredOpen}
        isLoading={isLoginPending}
        onClose={closeDrivePermissionRequired}
        onRetry={retryDrivePermission}
      />
    </>
  );

  const handleDashboardClick = async (e: MouseEvent) => {
    if (pathname.startsWith('/editor') && isDirty) {
      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
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

  const handleLogoutClick = async () => {
    if (pathname.startsWith('/editor') && isDirty) {
      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
      });

      if (!isConfirm) return;
    }

    await logout();
  };

  if (isLoggedIn) {
    return (
      <>
        <button
          type="button"
          onClick={handleDashboardClick}
          disabled={isBusy}
          aria-label="Go to dashboard"
          className={HEADER_ACTION_CLASS}
        >
          My Page
        </button>
        <button
          type="button"
          onClick={handleLogoutClick}
          disabled={isBusy}
          className={HEADER_ACTION_CLASS}
        >
          Logout
        </button>
        {modals}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={login}
        disabled={isBusy}
        className={HEADER_ACTION_CLASS}
      >
        Login
      </button>
      {modals}
    </>
  );
}

export default HeaderAuthControl;
