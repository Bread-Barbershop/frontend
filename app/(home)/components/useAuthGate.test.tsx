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

describe('useAuthGate', () => {
  const mockFetch = jest.fn();
  const mockPopupFocus = jest.fn();
  const mockPopupClose = jest.fn();
  let mockPopupClosed = false;

  beforeEach(() => {
    jest.resetAllMocks();

    global.fetch = mockFetch as unknown as typeof fetch;
    mockPopupClosed = false;

    window.open = jest.fn(() => {
      return {
        focus: mockPopupFocus,
        close: mockPopupClose,
        get closed() {
          return mockPopupClosed;
        },
      } as unknown as Window;
    });
  });

  it('opens privacy notice before login modal for unauthenticated runAfterAuth', async () => {
    const action = jest.fn();

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);
    expect(result.current.isPrivacyNoticeOpen).toBe(false);

    act(() => {
      result.current.runAfterAuth(action);
    });

    expect(action).not.toHaveBeenCalled();
    expect(result.current.isPrivacyNoticeOpen).toBe(true);
    expect(result.current.isLoginOpen).toBe(false);

    act(() => {
      result.current.closePrivacyNotice();
    });

    expect(result.current.isPrivacyNoticeOpen).toBe(false);
    expect(result.current.isLoginOpen).toBe(true);
  });

  it('opens privacy notice before login modal when login is requested', async () => {
    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.login();
    });

    expect(result.current.isPrivacyNoticeOpen).toBe(true);
    expect(result.current.isLoginOpen).toBe(false);

    act(() => {
      result.current.closePrivacyNotice();
    });

    expect(result.current.isPrivacyNoticeOpen).toBe(false);
    expect(result.current.isLoginOpen).toBe(true);
  });

  it('opens an OAuth popup when loginWithGoogle is called', async () => {
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

  it('releases pending state on focus when session is still unauthenticated', async () => {
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
    mockPopupClosed = true;

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'GET',
        cache: 'no-store',
      });
    });

    await waitFor(() => {
      expect(result.current.isLoginPending).toBe(false);
      expect(result.current.isLoginOpen).toBe(false);
    });
  });

  it('clears popup and modal state when closeLogin is called while login is pending', async () => {
    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.login();
    });

    act(() => {
      result.current.closePrivacyNotice();
    });

    act(() => {
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

  it('sets login state and refreshes on GOOGLE_OAUTH_SUCCESS without reopening privacy notice', async () => {
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
    expect(result.current.isPrivacyNoticeOpen).toBe(false);
    expect(refreshMock).toHaveBeenCalled();
  });

  it('runs pending action on GOOGLE_OAUTH_SUCCESS after the pre-login notice flow', async () => {
    const action = jest.fn();

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.runAfterAuth(action);
    });

    act(() => {
      result.current.closePrivacyNotice();
    });

    act(() => {
      result.current.loginWithGoogle();
    });

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

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.isPrivacyNoticeOpen).toBe(false);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('opens Drive permission modal and preserves pending action when Drive scope is missing', async () => {
    const action = jest.fn();

    const { result } = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );

    act(() => {
      result.current.runAfterAuth(action);
    });

    act(() => {
      result.current.closePrivacyNotice();
    });

    act(() => {
      result.current.loginWithGoogle();
    });

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: {
            type: 'GOOGLE_OAUTH_ERROR',
            reason: 'missing_drive_scope',
          },
        })
      );
    });

    expect(result.current.isLoginPending).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);
    expect(result.current.isDrivePermissionRequiredOpen).toBe(true);
    expect(action).not.toHaveBeenCalled();

    act(() => {
      result.current.retryDrivePermission();
    });

    expect(window.open).toHaveBeenCalledTimes(2);
    expect(result.current.isDrivePermissionRequiredOpen).toBe(false);
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

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('only the hook instance with an OAuth popup handles the success message', async () => {
    const headerGate = renderHook(() =>
      useAuthGate({ initialIsLoggedIn: false })
    );
    const ctaGate = renderHook(() => useAuthGate({ initialIsLoggedIn: false }));

    act(() => {
      ctaGate.result.current.loginWithGoogle();
    });

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: 'GOOGLE_OAUTH_SUCCESS' },
        })
      );
    });

    await waitFor(() => {
      expect(ctaGate.result.current.isLoggedIn).toBe(true);
    });

    expect(headerGate.result.current.isLoggedIn).toBe(false);
  });

  it('redirects home when a logged-in runAfterAuth session check fails', async () => {
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

  it('logs out, redirects home, and clears login state', async () => {
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
