/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/api/auth/callback/route.ts 의 GET 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) error query가 있으면 400을 반환하는지
 * 2) code가 없으면 400을 반환하는지
 * 3) state mismatch면 400을 반환하는지
 * 4) pkce_code_verifier가 없으면 400을 반환하는지
 * 5) token 교환 성공 시 쿠키 저장 + HTML 응답을 반환하는지
 * 6) token 교환 실패 시 해당 status/json을 그대로 반환하는지
 * 7) token 교환 도중 예외 발생 시 500을 반환하는지
 *
 * 왜 중요한가:
 * 이 라우트는 OAuth 로그인 완료 지점이다.
 * 즉, state 검증 / PKCE 검증 / token 교환 / 쿠키 저장 / 팝업 성공 응답까지
 * 인증 흐름의 핵심 완료 단계를 담당한다.
 */

import { GET } from '@/app/api/auth/callback/route';

// ------------------------------
// next/headers 의 cookies()를 mock 처리
// 실제 Next.js cookie store 대신 테스트용 가짜 store를 사용한다.
// ------------------------------
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

import { cookies } from 'next/headers';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

type MockCookieStore = {
  get: jest.Mock;
  set: jest.Mock;
};

/**
 * callback route용 cookie store 헬퍼
 *
 * 이 라우트는:
 * - get('oauth_state')
 * - get('pkce_code_verifier')
 * 를 읽고,
 * - set(...)으로 oauth_state / pkce_code_verifier 삭제
 * - access_token / refresh_token 저장
 * 을 수행한다.
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

describe('auth callback Route Handler 테스트', () => {
  const originalEnv = process.env;
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'google-client-id-123',
      GOOGLE_CLIENT_SECRET: 'google-client-secret-456',
    };

    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('error query가 있으면 400을 반환한다', async () => {
    /**
     * 목적:
     * Google OAuth callback에 error가 포함되어 들어온 경우
     * 즉시 400 에러를 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({});
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const req = new Request(
      'http://localhost:3000/api/auth/callback?error=access_denied',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: 'Google Auth Error: access_denied',
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('code가 없으면 400을 반환한다', async () => {
    /**
     * 목적:
     * callback 요청에 code가 없는 경우
     * token 교환을 시도하지 않고 400을 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({});
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const req = new Request(
      'http://localhost:3000/api/auth/callback?state=abc',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: 'No code provided',
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('state mismatch면 400을 반환한다', async () => {
    /**
     * 목적:
     * callback의 state와 쿠키에 저장된 oauth_state가 다르면
     * CSRF 방지를 위해 400을 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      oauth_state: 'cookie-state',
      pkce_code_verifier: 'verifier-123',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const req = new Request(
      'http://localhost:3000/api/auth/callback?code=auth-code-1&state=query-state',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: 'Invalid state',
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('pkce_code_verifier가 없으면 400을 반환한다', async () => {
    /**
     * 목적:
     * state는 맞지만 PKCE verifier가 없으면
     * token 교환을 진행하지 않고 400을 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      oauth_state: 'matched-state',
      pkce_code_verifier: undefined,
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const req = new Request(
      'http://localhost:3000/api/auth/callback?code=auth-code-2&state=matched-state',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: 'Missing PKCE code_verifier',
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('token 교환 성공 시 쿠키를 저장하고 HTML 응답을 반환한다', async () => {
    /**
     * 목적:
     * code/state/verifier가 정상이고
     * Google token 교환도 성공하면
     * access_token / refresh_token 쿠키를 저장하고
     * 팝업 성공 HTML을 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      oauth_state: 'matched-state',
      pkce_code_verifier: 'verifier-abc',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      }),
    });

    const req = new Request(
      'http://localhost:3000/api/auth/callback?code=auth-code-3&state=matched-state',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const html = await res.text();

    /**
     * 먼저 token 교환 요청이 올바르게 나가는지 확인
     */
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    /**
     * state / pkce verifier는 사용 후 제거해야 한다.
     */
    expect(cookieStore.set).toHaveBeenCalledWith('oauth_state', '', {
      path: '/',
      maxAge: 0,
    });

    expect(cookieStore.set).toHaveBeenCalledWith('pkce_code_verifier', '', {
      path: '/',
      maxAge: 0,
    });

    /**
     * 새 access token 저장
     */
    expect(cookieStore.set).toHaveBeenCalledWith(
      'access_token',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      })
    );

    /**
     * refresh token도 응답에 있으면 저장
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

    /**
     * 최종 응답은 팝업 닫기용 HTML
     */
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(html).toContain('로그인 성공! 창을 닫는 중...');
    expect(html).toContain('GOOGLE_OAUTH_SUCCESS');
  });

  it('token 교환 실패 시 Google 응답 status/json을 그대로 반환한다', async () => {
    /**
     * 목적:
     * Google token endpoint가 실패했을 때
     * 해당 응답(status/json)을 그대로 전달하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      oauth_state: 'matched-state',
      pkce_code_verifier: 'verifier-xyz',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({
        error: 'invalid_grant',
      }),
    });

    const req = new Request(
      'http://localhost:3000/api/auth/callback?code=auth-code-4&state=matched-state',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({
      error: 'invalid_grant',
    });

    /**
     * state / pkce verifier 삭제는 token 교환 전에 수행되므로
     * 실패 케이스에서도 호출되어야 한다.
     */
    expect(cookieStore.set).toHaveBeenCalledWith('oauth_state', '', {
      path: '/',
      maxAge: 0,
    });

    expect(cookieStore.set).toHaveBeenCalledWith('pkce_code_verifier', '', {
      path: '/',
      maxAge: 0,
    });
  });

  it('token 교환 과정에서 예외가 발생하면 500을 반환한다', async () => {
    /**
     * 목적:
     * fetch 자체가 reject 되는 등 token 교환 과정에서 예외가 발생하면
     * 내부 서버 오류(500)로 처리하는지 확인한다.
     */

    const cookieStore = createCookieStore({
      oauth_state: 'matched-state',
      pkce_code_verifier: 'verifier-throw',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    mockFetch.mockRejectedValue(new Error('network error'));

    const req = new Request(
      'http://localhost:3000/api/auth/callback?code=auth-code-5&state=matched-state',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({
      error: 'Internal Server Error',
    });
  });
});
