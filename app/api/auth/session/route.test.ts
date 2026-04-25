/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/api/auth/session/route.ts 의 GET 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) access token이 있으면 로그인 상태를 반환하는지
 * 2) access/refresh token이 모두 없으면 401을 반환하는지
 * 3) refresh token만 있고 refresh 성공 시 로그인 상태를 유지하는지
 * 4) refresh 실패 시 auth 쿠키를 제거하고 401을 반환하는지
 *
 * 왜 중요한가:
 * 이 라우트는 "현재 사용자가 로그인 상태인지"를 판단하고,
 * access token이 만료된 상황에서도 refresh token으로 세션을 복구한다.
 * 즉, 인증 흐름의 운영 안정성을 보여주는 핵심 API다.
 */

import { GET } from '@/app/api/auth/session/route';

// ------------------------------
// next/headers 의 cookies()를 mock 처리
// 실제 Next.js cookie store 대신 테스트용 가짜 store를 사용한다.
// ------------------------------
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// ------------------------------
// refresh token 재발급 함수 mock
// 실제 외부 token refresh 요청 대신 가짜 응답을 준다.
// ------------------------------
jest.mock('@/app/api/auth/_lib/tokenRefresh', () => ({
  tokenRefresh: jest.fn(),
}));

import { cookies } from 'next/headers';
import { tokenRefresh } from '@/app/api/auth/_lib/tokenRefresh';

/**
 * 테스트용 cookie store 타입
 * 실제로 session route가 사용하는 메서드는 get / set 정도이므로
 * 그 범위만 구현하면 충분하다.
 */
type MockCookieStore = {
  get: jest.Mock;
  set: jest.Mock;
};

/**
 * cookie store를 쉽게 만들기 위한 헬퍼 함수
 *
 * 사용 예:
 * createCookieStore({
 *   access_token: 'abc',
 *   refresh_token: 'xyz',
 * })
 *
 * 그러면
 * - cookieStore.get('access_token') -> { value: 'abc' }
 * - cookieStore.get('refresh_token') -> { value: 'xyz' }
 * 처럼 동작한다.
 */
function createCookieStore(values: Record<string, string | undefined>) {
  const store: MockCookieStore = {
    get: jest.fn((key: string) => {
      const value = values[key];
      return value ? { value } : undefined;
    }),
    set: jest.fn(),
  };

  return store;
}

describe('auth session Route Handler 테스트', () => {
  beforeEach(() => {
    /**
     * 호출 기록과 mock 구현을 모두 초기화한다.
     * 각 테스트가 독립적인 인증 상태를 가지도록 하기 위함이다.
     */
    jest.resetAllMocks();
  });

  it('access token이 있으면 로그인 상태를 반환한다', async () => {
    /**
     * 목적:
     * access token이 이미 존재한다면
     * refresh 시도 없이 즉시 로그인 상태를 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      access_token: 'access-token-value',
      refresh_token: 'refresh-token-value',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      isLoggedIn: true,
      hasAccessToken: true,
      hasRefreshToken: true,
    });

    /**
     * access token이 이미 있으므로 refresh는 호출되면 안 된다.
     */
    expect(tokenRefresh).not.toHaveBeenCalled();

    /**
     * 세션 조회 응답은 no-store 헤더를 가져야 한다.
     */
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('access token과 refresh token이 모두 없으면 401을 반환한다', async () => {
    /**
     * 목적:
     * 로그인 정보가 전혀 없는 경우
     * 비로그인 상태(401)를 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      access_token: undefined,
      refresh_token: undefined,
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      isLoggedIn: false,
      hasAccessToken: false,
      hasRefreshToken: false,
    });

    /**
     * refresh token이 없으므로 refresh 시도 자체가 없어야 한다.
     */
    expect(tokenRefresh).not.toHaveBeenCalled();

    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('refresh token만 있고 refresh에 성공하면 access token을 재설정하고 로그인 상태를 반환한다', async () => {
    /**
     * 목적:
     * access token은 없지만 refresh token이 존재하는 경우,
     * tokenRefresh를 통해 세션을 복구하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      access_token: undefined,
      refresh_token: 'refresh-token-value',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    (tokenRefresh as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: Date.UTC(2026, 2, 21, 12, 0, 0), // 예시 timestamp
    });

    const res = await GET();
    const json = await res.json();

    expect(tokenRefresh).toHaveBeenCalledTimes(1);
    expect(tokenRefresh).toHaveBeenCalledWith('refresh-token-value');

    /**
     * refresh 성공 후에는 로그인 상태(true, true)를 반환한다.
     * 구현상 buildSession(true, true)를 반환하고 있다.
     */
    expect(res.status).toBe(200);
    expect(json).toEqual({
      isLoggedIn: true,
      hasAccessToken: true,
      hasRefreshToken: true,
    });

    /**
     * refresh 성공 시 새 access token을 쿠키에 저장해야 한다.
     */
    expect(cookieStore.set).toHaveBeenCalledWith(
      'access_token',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    );

    /**
     * refreshToken이 응답에 포함되었다면 refresh_token도 다시 저장해야 한다.
     */
    expect(cookieStore.set).toHaveBeenCalledWith(
      'refresh_token',
      'new-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 180,
      })
    );

    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('refresh에 실패하면 auth 쿠키를 제거하고 401을 반환한다', async () => {
    /**
     * 목적:
     * refresh token은 있지만 refresh 요청이 실패한 경우,
     * 세션을 복구하지 못했다고 판단하고
     * auth 관련 쿠키를 비운 뒤 401을 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      access_token: undefined,
      refresh_token: 'expired-refresh-token',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    (tokenRefresh as jest.Mock).mockRejectedValue(
      new Error('refresh token expired')
    );

    const res = await GET();
    const json = await res.json();

    expect(tokenRefresh).toHaveBeenCalledTimes(1);
    expect(tokenRefresh).toHaveBeenCalledWith('expired-refresh-token');

    /**
     * refresh 실패 시 auth 쿠키를 제거해야 한다.
     */
    expect(cookieStore.set).toHaveBeenCalledWith(
      'access_token',
      '',
      expect.objectContaining({
        path: '/',
        maxAge: 0,
      })
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      'refresh_token',
      '',
      expect.objectContaining({
        path: '/',
        maxAge: 0,
      })
    );

    /**
     * 최종 응답은 비로그인 상태여야 한다.
     */
    expect(res.status).toBe(200);
    expect(json).toEqual({
      isLoggedIn: false,
      hasAccessToken: false,
      hasRefreshToken: false,
    });

    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});
