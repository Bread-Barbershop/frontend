'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// 서버 렌더링된 세션 데이터로부터 인증 상태를 초기화하기 위한 옵션
type UseAuthGateOptions = {
  initialIsLoggedIn?: boolean;
};

// 가운데 정렬된 팝업 창으로 구글 OAuth를 연다
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

// 로그인 모달, 팝업 로그인 흐름, 로그인 후 동작까지 관리하는 Auth 게이트 훅
export function useAuthGate(options: UseAuthGateOptions = {}) {
  const { initialIsLoggedIn = false } = options;
  const router = useRouter();

  // 현재 로그인/세션 상태
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  // 중복 동작을 막기 위한 전역 처리중(busy) 플래그
  const [isBusy, setIsBusy] = useState(false);
  // 로그인 모달의 열림/닫힘 상태
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  // 버튼/모달 가드를 위한 OAuth 진행중 상태
  const [isLoginPending, setIsLoginPending] = useState(false);

  // 현재 활성화된 OAuth 팝업 창 참조
  const popupRef = useRef<Window | null>(null);
  // 로그인 전에 예약해 둔 액션; 로그인 성공 직후 실행됨
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  // 외부에서 들어온 초기값과 내부 로그인 상태를 동기화한다
  useEffect(() => {
    setIsLoggedIn(initialIsLoggedIn);
  }, [initialIsLoggedIn]);

  // OAuth 팝업에서 보내는 성공/실패 메시지를 처리한다
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // 같은 출처(origin)에서 온 메시지만 신뢰한다
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

  // 사용자가 팝업을 직접 닫았을 때 pending 상태를 해제한다
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

  // 로그인 모달 열기
  const login = () => {
    setIsLoginOpen(true);
  };

  // OAuth가 진행 중이 아니면 모달을 닫는다
  const closeLogin = () => {
    if (isLoginPending) return;

    setIsLoginOpen(false);
    pendingActionRef.current = null;
  };

  // 구글 OAuth 팝업을 시작하거나, 이미 열려 있으면 그 팝업을 포커스한다
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

  // API로 로그아웃 요청을 보내고 인증 관련 UI를 새로고침한다
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

  // 로그인 상태면 바로 실행, 아니면 로그인 성공 후 실행되도록 액션을 예약한다
  const runAfterAuth = (action: () => void | Promise<void>) => {
    if (isLoggedIn) {
      void Promise.resolve(action()).catch(console.error);
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
