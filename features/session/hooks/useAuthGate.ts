'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseAuthGateOptions = {
  initialIsLoggedIn?: boolean;
};

type SessionResponse = {
  isLoggedIn: boolean;
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

  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);

  const popupRef = useRef<Window | null>(null);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  const releaseLoginPending = useCallback(() => {
    popupRef.current = null;
    setIsLoginPending(false);
  }, []);

  const clearLoginAttempt = useCallback((closePopup = false) => {
    const popup = popupRef.current;
    popupRef.current = null;
    setIsLoginPending(false);
    setIsLoginOpen(false);
    pendingActionRef.current = null;

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
    setIsLoggedIn(true);

    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;

    if (pendingAction) {
      void Promise.resolve(pendingAction()).catch(console.error);
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

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        completeLoginSuccess();
        return;
      }

      if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
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

      releaseLoginPending();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [completeLoginSuccess, isLoginPending, releaseLoginPending]);

  const login = () => {
    setIsLoginOpen(true);
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

  const validateSession = async () => {
    try {
      const isSessionValid = await fetchSessionState();

      if (!isSessionValid) {
        pendingActionRef.current = null;
        setIsLoggedIn(false);
        setIsLoginOpen(false);
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
    login,
    closeLogin,
    loginWithGoogle,
    logout,
    runAfterAuth,
  };
}
