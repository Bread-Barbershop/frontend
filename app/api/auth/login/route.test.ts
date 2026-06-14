/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/api/auth/login/route.ts 의 GET 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) GOOGLE_CLIENT_ID가 없으면 500을 반환하는지
 * 2) 정상 환경이면 Google OAuth URL로 redirect 하는지
 * 3) oauth_state, pkce_code_verifier 쿠키를 저장하는지
 * 4) redirect URL에 필요한 query parameter가 올바르게 들어가는지
 *
 * 왜 중요한가:
 * 이 라우트는 인증 흐름의 시작점이다.
 * 즉, Google OAuth에 필요한 state / PKCE / redirect_uri / scope 구성이
 * 안전하고 일관되게 세팅되는지를 검증하는 테스트다.
 */

import { GET } from '@/app/api/auth/login/route';

// ------------------------------
// next/headers 의 cookies()를 mock 처리
// 실제 Next.js cookie store 대신 테스트용 가짜 store를 사용한다.
// ------------------------------
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// ------------------------------
// OAuth state 생성 함수 mock
// 테스트에서 예측 가능한 값이 나오도록 고정한다.
// ------------------------------
jest.mock('@/app/api/auth/_lib/generateOAuthState', () => ({
  generateOAuthState: jest.fn(),
}));

// ------------------------------
// PKCE 관련 함수 mock
// code_verifier / code_challenge 값을 고정해서
// redirect URL과 쿠키 값을 쉽게 검증할 수 있게 한다.
// ------------------------------
jest.mock('@/app/api/auth/_lib/pkce', () => ({
  generateCodeVerifier: jest.fn(),
  generateCodeChallenge: jest.fn(),
}));

import { cookies } from 'next/headers';
import { generateOAuthState } from '@/app/api/auth/_lib/generateOAuthState';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from '@/app/api/auth/_lib/pkce';

type MockCookieStore = {
  set: jest.Mock;
};

/**
 * 간단한 cookie store 헬퍼
 * login route에서는 get이 아니라 set만 사용하므로
 * set 메서드만 있는 최소 mock store를 만든다.
 */
function createCookieStore() {
  const store: MockCookieStore = {
    set: jest.fn(),
  };

  return store;
}

describe('auth login Route Handler 테스트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    /**
     * 각 테스트가 process.env와 mock 상태를 공유하지 않도록 초기화한다.
     */
    jest.resetAllMocks();

    process.env = {
      ...originalEnv,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('GOOGLE_CLIENT_ID가 없으면 500을 반환한다', async () => {
    /**
     * 목적:
     * 로그인 시작에 필요한 GOOGLE_CLIENT_ID가 없을 경우
     * route가 즉시 500 에러를 반환하는지 확인한다.
     */

    const cookieStore = createCookieStore();
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    delete process.env.GOOGLE_CLIENT_ID;

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'GET',
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({
      error: 'GOOGLE_CLIENT_ID is missing',
    });

    /**
     * client id가 없으므로 state / pkce 생성도 일어나면 안 된다.
     */
    expect(generateOAuthState).not.toHaveBeenCalled();
    expect(generateCodeVerifier).not.toHaveBeenCalled();
    expect(generateCodeChallenge).not.toHaveBeenCalled();

    /**
     * 쿠키 저장도 발생하면 안 된다.
     */
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('정상 환경이면 Google OAuth URL로 redirect 한다', async () => {
    /**
     * 목적:
     * GOOGLE_CLIENT_ID가 존재하고 필요한 값들이 정상 생성되면,
     * route가 Google OAuth URL로 redirect 하는지 확인한다.
     */

    const cookieStore = createCookieStore();
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    process.env.GOOGLE_CLIENT_ID = 'google-client-id-123';

    (generateOAuthState as jest.Mock).mockReturnValue('state-abc');
    (generateCodeVerifier as jest.Mock).mockReturnValue('verifier-xyz');
    (generateCodeChallenge as jest.Mock).mockReturnValue('challenge-123');

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'GET',
    });

    const res = await GET(req);

    /**
     * NextResponse.redirect(...) 이므로 3xx 응답이 와야 한다.
     * 일반적으로 redirect 응답은 location 헤더를 가진다.
     */
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);

    const location = res.headers.get('location');
    expect(location).toBeTruthy();

    const redirectUrl = new URL(location!);

    /**
     * redirect 대상이 Google OAuth endpoint인지 확인
     */
    expect(redirectUrl.origin).toBe('https://accounts.google.com');
    expect(redirectUrl.pathname).toBe('/o/oauth2/v2/auth');

    /**
     * 필수 query parameter 검증
     */
    expect(redirectUrl.searchParams.get('client_id')).toBe(
      'google-client-id-123'
    );
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/callback'
    );
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('access_type')).toBe('offline');
    expect(redirectUrl.searchParams.get('prompt')).toBe('consent');
    expect(redirectUrl.searchParams.get('include_granted_scopes')).toBe('true');
    expect(redirectUrl.searchParams.get('scope')).toBe(
      'openid https://www.googleapis.com/auth/drive.file'
    );
    expect(redirectUrl.searchParams.get('state')).toBe('state-abc');
    expect(redirectUrl.searchParams.get('code_challenge')).toBe(
      'challenge-123'
    );
    expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('oauth_state와 pkce_code_verifier 쿠키를 저장한다', async () => {
    /**
     * 목적:
     * 로그인 시작 시 CSRF 방지용 state와
     * PKCE 검증용 code_verifier가 쿠키에 저장되는지 확인한다.
     */

    const cookieStore = createCookieStore();
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    process.env.GOOGLE_CLIENT_ID = 'google-client-id-123';

    (generateOAuthState as jest.Mock).mockReturnValue('state-cookie-test');
    (generateCodeVerifier as jest.Mock).mockReturnValue('verifier-cookie-test');
    (generateCodeChallenge as jest.Mock).mockReturnValue(
      'challenge-cookie-test'
    );

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'GET',
    });

    await GET(req);

    /**
     * oauth_state 쿠키가 저장되는지 확인
     */
    expect(cookieStore.set).toHaveBeenCalledWith(
      'oauth_state',
      'state-cookie-test',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
      })
    );

    /**
     * pkce_code_verifier 쿠키가 저장되는지 확인
     */
    expect(cookieStore.set).toHaveBeenCalledWith(
      'pkce_code_verifier',
      'verifier-cookie-test',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
      })
    );
  });

  it('redirect URL 구성에 필요한 생성 함수들이 정상 호출된다', async () => {
    /**
     * 목적:
     * state, verifier, challenge 생성 함수들이
     * 로그인 시작 과정에서 올바른 순서/값으로 사용되는지 확인한다.
     */

    const cookieStore = createCookieStore();
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    process.env.GOOGLE_CLIENT_ID = 'google-client-id-123';

    (generateOAuthState as jest.Mock).mockReturnValue('state-for-call-test');
    (generateCodeVerifier as jest.Mock).mockReturnValue(
      'verifier-for-call-test'
    );
    (generateCodeChallenge as jest.Mock).mockReturnValue(
      'challenge-for-call-test'
    );

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'GET',
    });

    await GET(req);

    expect(generateOAuthState).toHaveBeenCalledTimes(1);
    expect(generateCodeVerifier).toHaveBeenCalledTimes(1);

    /**
     * generateCodeChallenge는 generateCodeVerifier가 만든 값을 인자로 받아야 한다.
     */
    expect(generateCodeChallenge).toHaveBeenCalledTimes(1);
    expect(generateCodeChallenge).toHaveBeenCalledWith(
      'verifier-for-call-test'
    );
  });
});
