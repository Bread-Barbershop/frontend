'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/shared/hooks/useToast';

type UseAuthGateOptions = {
  initialIsLoggedIn?: boolean;
};

type SessionResponse = {
  isLoggedIn: boolean;
};

type GoogleOAuthMessage = {
  type?: 'GOOGLE_OAUTH_SUCCESS' | 'GOOGLE_OAUTH_ERROR';
  reason?: 'access_denied' | 'missing_drive_scope';
};

function openGoogleLoginPopup() {
  const width = 480;
  const height = 640;

  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    '/api/auth/login',
    'google-oauth',
    `width=${width},height=${height},left=${left},top=${top}`
  );
}

async function fetchSessionState() {
  const res = await fetch('/api/auth/session', {
    method: 'GET',
    cache: 'no-store',
  });

  if (res.status === 401) {
    return false;
  }

  if (!res.ok) {
    throw new Error(`session check failed: ${res.status}`);
  }

  const session = (await res.json()) as SessionResponse;
  return session.isLoggedIn;
}

export function useAuthGate(options: UseAuthGateOptions = {}) {
  const { initialIsLoggedIn = false } = options;
  const router = useRouter();
  const { success } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);
  const [isDrivePermissionRequiredOpen, setIsDrivePermissionRequiredOpen] =
    useState(false);

  const popupRef = useRef<Window | null>(null);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const openLoginAfterNoticeRef = useRef(false);

  const releaseLoginPending = useCallback(() => {
    popupRef.current = null;
    setIsLoginPending(false);
  }, []);

  const clearLoginAttempt = useCallback((closePopup = false) => {
    const popup = popupRef.current;
    popupRef.current = null;
    setIsLoginPending(false);
    setIsLoginOpen(false);
    setIsDrivePermissionRequiredOpen(false);
    pendingActionRef.current = null;
    openLoginAfterNoticeRef.current = false;

    if (closePopup && popup) {
      try {
        popup.close();
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const completeLoginSuccess = useCallback(() => {
    popupRef.current = null;
    setIsLoginPending(false);
    setIsLoginOpen(false);
    setIsDrivePermissionRequiredOpen(false);
    setIsLoggedIn(true);

    success('로그인에 성공했습니다.');

    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;

    if (pendingAction) {
      void Promise.resolve(pendingAction()).catch(console.error);
      return;
    }

    router.refresh();
  }, [router, success]);

  const closePrivacyNotice = useCallback(() => {
    setIsPrivacyNoticeOpen(false);

    if (openLoginAfterNoticeRef.current) {
      openLoginAfterNoticeRef.current = false;
      setIsLoginOpen(true);
      return;
    }

    router.refresh();
  }, [router]);

  useEffect(() => {
    setIsLoggedIn(initialIsLoggedIn);
  }, [initialIsLoggedIn]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!popupRef.current) return;

      const message = event.data as GoogleOAuthMessage;

      if (message.type === 'GOOGLE_OAUTH_SUCCESS') {
        completeLoginSuccess();
        return;
      }

      if (message.type === 'GOOGLE_OAUTH_ERROR') {
        if (message.reason === 'missing_drive_scope') {
          popupRef.current = null;
          setIsLoginPending(false);
          setIsLoginOpen(false);
          setIsDrivePermissionRequiredOpen(true);
          return;
        }

        clearLoginAttempt();
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [clearLoginAttempt, completeLoginSuccess]);

  useEffect(() => {
    if (!isLoginPending) return;

    const handleFocus = async () => {
      try {
        if (await fetchSessionState()) {
          completeLoginSuccess();
          return;
        }
      } catch (err) {
        console.error(err);
      }

      const popup = popupRef.current;
      if (popup && !popup.closed) {
        return;
      }

      window.setTimeout(() => {
        if (popupRef.current?.closed) {
          releaseLoginPending();
        }
      }, 250);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [completeLoginSuccess, isLoginPending, releaseLoginPending]);

  const login = () => {
    openLoginAfterNoticeRef.current = true;
    setIsPrivacyNoticeOpen(true);
  };

  const closeLogin = () => {
    clearLoginAttempt(true);
  };

  const loginWithGoogle = () => {
    if (popupRef.current) {
      popupRef.current.focus();
      return;
    }

    setIsLoginPending(true);
    popupRef.current = openGoogleLoginPopup();
    if (!popupRef.current) {
      setIsLoginPending(false);
    }
  };

  const closeDrivePermissionRequired = () => {
    pendingActionRef.current = null;
    setIsDrivePermissionRequiredOpen(false);
    setIsLoginPending(false);
  };

  const retryDrivePermission = () => {
    setIsDrivePermissionRequiredOpen(false);
    loginWithGoogle();
  };

  const validateSession = async () => {
    try {
      const isSessionValid = await fetchSessionState();

      if (!isSessionValid) {
        pendingActionRef.current = null;
        openLoginAfterNoticeRef.current = false;
        setIsLoggedIn(false);
        setIsLoginOpen(false);
        setIsPrivacyNoticeOpen(false);
        setIsDrivePermissionRequiredOpen(false);
        router.replace('/');
        router.refresh();
        return false;
      }

      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = async () => {
    if (isBusy) return;

    setIsBusy(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`logout failed: ${res.status}`);
      }

      setIsLoggedIn(false);
      setIsPrivacyNoticeOpen(false);
      setIsDrivePermissionRequiredOpen(false);
      openLoginAfterNoticeRef.current = false;
      router.replace('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBusy(false);
    }
  };

  const runAfterAuth = (action: () => void | Promise<void>) => {
    if (isLoggedIn) {
      if (isBusy) return;

      setIsBusy(true);
      void (async () => {
        const isSessionValid = await validateSession();
        if (!isSessionValid) return;

        await Promise.resolve(action());
      })()
        .catch(console.error)
        .finally(() => {
          setIsBusy(false);
        });
      return;
    }

    pendingActionRef.current = action;
    login();
  };

  return {
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
  };
}
