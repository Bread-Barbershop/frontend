'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type UseAuthGateOptions = {
  initialIsLoggedIn?: boolean;
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

export function useAuthGate(options: UseAuthGateOptions = {}) {
  const { initialIsLoggedIn = false } = options;
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);

  const popupRef = useRef<Window | null>(null);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    setIsLoggedIn(initialIsLoggedIn);
  }, [initialIsLoggedIn]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
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
        return;
      }

      if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
        popupRef.current = null;
        setIsLoginPending(false);
        pendingActionRef.current = null;
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  useEffect(() => {
    if (!isLoginPending) return;

    const intervalId = window.setInterval(() => {
      const popup = popupRef.current;
      if (!popup || popup.closed) {
        popupRef.current = null;
        setIsLoginPending(false);
        pendingActionRef.current = null;
      }
    }, 300);

    return () => window.clearInterval(intervalId);
  }, [isLoginPending]);

  const login = () => {
    setIsLoginOpen(true);
  };

  const closeLogin = () => {
    if (isLoginPending) return;

    setIsLoginOpen(false);
    pendingActionRef.current = null;
  };

  const loginWithGoogle = () => {
    if (popupRef.current && !popupRef.current.closed) {
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
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        cache: 'no-store',
      });

      if (res.status === 401) {
        pendingActionRef.current = null;
        setIsLoggedIn(false);
        setIsLoginOpen(false);
        router.replace('/');
        router.refresh();
        return false;
      }

      if (!res.ok) {
        throw new Error(`session check failed: ${res.status}`);
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
