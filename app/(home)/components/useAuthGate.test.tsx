/**
 * @jest-environment jsdom
 */

/**
 * 목적:
 * app/(home)/components/useAuthGate.ts 의 useAuthGate 훅을 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 비로그인 상태에서 runAfterAuth() 호출 시 로그인 모달이 열리는지
 * 2) loginWithGoogle() 호출 시 popup을 여는지
 * 3) GOOGLE_OAUTH_SUCCESS 메시지 수신 시 로그인 상태가 true가 되는지
 * 4) 로그인된 상태에서 runAfterAuth() 실행 시 session 401이면 홈으로 보내는지
 * 5) logout() 호출 시 로그아웃 후 로그인 상태가 false가 되는지
 *
 * 왜 중요한가:
 * useAuthGate는 클라이언트에서 인증 상태를 실제 사용자 경험으로 연결하는 핵심 훅이다.
 * 즉, 로그인 모달, OAuth popup, 세션 검증, 로그아웃, 로그인 후 후속 액션 실행까지
 * "사용자가 느끼는 인증 흐름"을 담당한다.
 */

import { act, renderHook, waitFor } from '@testing-library/react';

import { useAuthGate } from '@/features/session/hooks/useAuthGate';

// ------------------------------
// next/navigation 의 useRouter mock
// 실제 라우팅 대신 호출 여부만 추적한다.
// ------------------------------
const pushMock = jest.fn();
const replaceMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

describe('useAuthGate 테스트', () => {
  const mockFetch = jest.fn();
  const mockPopupFocus = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // 테스트마다 fetch를 새 mock으로 연결
    global.fetch = mockFetch as unknown as typeof fetch;

    /**
     * window.open mock
     * loginWithGoogle 호출 시 popup이 열리는지 검증하는 데 사용한다.
     */
    window.open = jest.fn(() => {
      return {
        closed: false,
        focus: mockPopupFocus,
      } as unknown as Window;
    });
  });

  it('비로그인 상태에서 runAfterAuth()를 호출하면 로그인 모달이 열린다', async () => {
    /**
     * 목적:
     * 아직 로그인되지 않은 사용자가 보호된 액션을 실행하려고 하면
     * action을 바로 실행하지 않고 로그인 모달을 열어야 한다.
     */

    const action = jest.fn();

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);

    act(() => {
      result.current.runAfterAuth(action);
    });

    /**
     * 비로그인 상태이므로 action은 즉시 실행되면 안 되고,
     * 대신 로그인 모달이 열려야 한다.
     */
    expect(action).not.toHaveBeenCalled();
    expect(result.current.isLoginOpen).toBe(true);
  });

  it('loginWithGoogle()를 호출하면 OAuth popup을 연다', async () => {
    /**
     * 목적:
     * 사용자가 Google 로그인 버튼을 눌렀을 때
     * popup이 열리고 login pending 상태가 되는지 확인한다.
     */

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.loginWithGoogle();
    });

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      '/api/auth/login',
      'google-oauth',
      expect.stringContaining('width=480')
    );

    expect(result.current.isLoginPending).toBe(true);
  });

  it('GOOGLE_OAUTH_SUCCESS 메시지를 받으면 로그인 상태가 true가 된다', async () => {
    /**
     * 목적:
     * popup 로그인 성공 후 postMessage가 도착하면
     * login pending이 해제되고 로그인 상태가 true가 되는지 확인한다.
     */

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    // 먼저 popup 로그인 시작
    act(() => {
      result.current.loginWithGoogle();
    });

    expect(result.current.isLoginPending).toBe(true);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: 'GOOGLE_OAUTH_SUCCESS' },
        })
      );
    });

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });

    expect(result.current.isLoginPending).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);

    /**
     * pendingAction이 없는 경우 구현상 router.refresh()를 호출한다.
     */
    expect(refreshMock).toHaveBeenCalled();
  });

  it('로그인된 상태에서 runAfterAuth() 실행 후 session이 401이면 홈으로 이동한다', async () => {
    /**
     * 목적:
     * 이미 로그인된 것처럼 보여도,
     * 서버 session 검증 결과가 401이면
     * 로그인 상태를 해제하고 홈으로 돌려보내는지 확인한다.
     */

    mockFetch.mockResolvedValue({
      status: 401,
      ok: false,
    });

    const action = jest.fn();

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: true })
    );

    expect(result.current.isLoggedIn).toBe(true);

    act(() => {
      result.current.runAfterAuth(action);
    });

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/');
    });

    /**
     * 세션이 유효하지 않으므로 보호된 action은 실행되면 안 된다.
     */
    expect(action).not.toHaveBeenCalled();

    /**
     * session 401 처리 후 refresh도 수행한다.
     */
    expect(refreshMock).toHaveBeenCalled();
  });

  it('logout() 호출 시 로그아웃 API 성공 후 로그인 상태가 false가 된다', async () => {
    /**
     * 목적:
     * logout API가 성공하면
     * 클라이언트 훅의 로그인 상태도 false로 바뀌는지 확인한다.
     */

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: true })
    );

    expect(result.current.isLoggedIn).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
    });

    expect(result.current.isLoggedIn).toBe(false);

    /**
     * 로그아웃 후 UI 갱신을 위해 refresh가 호출된다.
     */
    expect(refreshMock).toHaveBeenCalled();
  });
});
