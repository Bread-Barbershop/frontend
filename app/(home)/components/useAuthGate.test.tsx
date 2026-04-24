/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react';

import { useAuthGate } from '@/features/session/hooks/useAuthGate';

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
  const mockPopupClose = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    global.fetch = mockFetch as unknown as typeof fetch;

    window.open = jest.fn(() => {
      return {
        focus: mockPopupFocus,
        close: mockPopupClose,
      } as unknown as Window;
    });
  });

  it('비로그인 상태에서 runAfterAuth()를 호출하면 로그인 모달이 열린다', async () => {
    const action = jest.fn();

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);

    act(() => {
      result.current.runAfterAuth(action);
    });

    expect(action).not.toHaveBeenCalled();
    expect(result.current.isLoginOpen).toBe(true);
  });

  it('loginWithGoogle()를 호출하면 OAuth popup이 열린다', async () => {
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

  it('popup이 아직 열려 있으면 focus 이벤트만으로 로그인 대기 상태를 해제하지 않는다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        isLoggedIn: false,
      }),
    });

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.loginWithGoogle();
    });

    expect(result.current.isLoginPending).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'GET',
        cache: 'no-store',
      });
    });

    expect(result.current.isLoginPending).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);
  });

  it('login pending 중 closeLogin()을 호출하면 popup과 modal 상태를 정리한다', async () => {
    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.login();
      result.current.loginWithGoogle();
    });

    expect(result.current.isLoginOpen).toBe(true);
    expect(result.current.isLoginPending).toBe(true);

    act(() => {
      result.current.closeLogin();
    });

    expect(mockPopupClose).toHaveBeenCalled();
    expect(result.current.isLoginPending).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);
  });

  it('GOOGLE_OAUTH_SUCCESS 메시지를 받으면 로그인 상태가 true가 된다', async () => {
    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

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
    expect(refreshMock).toHaveBeenCalled();
  });

  it('로그인된 상태에서 runAfterAuth() 실행 후 session이 401이면 루트로 이동한다', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        isLoggedIn: false,
      }),
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

    expect(action).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it('logout() 호출 후 로그아웃 API 성공 시 루트로 이동하고 로그인 상태가 false가 된다', async () => {
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
    expect(replaceMock).toHaveBeenCalledWith('/');
    expect(refreshMock).toHaveBeenCalled();
  });
});
