/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => jest.requireActual('./fixtures/redis').redisMock),
}));
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => ({
      value: jest.requireActual('./fixtures/redis').cookieEntries.get(key),
    }),
    set: (key: string, value: string) =>
      jest.requireActual('./fixtures/redis').cookieEntries.set(key, value),
  }),
}));
jest.mock('./tokenRefresh', () => ({ tokenRefresh: jest.fn() }));

import { authKey, authRedis, AuthStorageError } from './authStorage';
import { cookieEntries, redisEntries } from './fixtures/redis';
import { testEncryptionKey } from './fixtures/session';
import { GOOGLE_AUTH_SCOPE } from './googleScopes';
import {
  createServerSession,
  deleteServerSession,
  readServerSession,
  serverAccessToken,
  SESSION_COOKIE,
} from './serverSession';
import { tokenRefresh } from './tokenRefresh';

describe('서버 전용 Google 세션', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  beforeEach(() => {
    redisEntries.clear();
    cookieEntries.clear();
    jest.clearAllMocks();
    process.env.AUTH_REDIS_REST_URL = 'https://redis.example.test';
    process.env.AUTH_REDIS_REST_TOKEN = 'fake-redis-token';
    process.env.AUTH_REDIS_NAMESPACE = 'invia:dev:auth:v1';
    process.env.AUTH_ENCRYPTION_KEY = testEncryptionKey;
    global.fetch = jest.fn(async () =>
      Response.json({ sub: 'google-verified-subject' })
    );
  });
  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });
  const create = (expires_in = 3600) =>
    createServerSession({
      access_token: 'fake-access',
      refresh_token: 'fake-refresh',
      expires_in,
      scope: GOOGLE_AUTH_SCOPE,
    });
  it('일반 로그인 정보는 암호화한 쿠키에만 보관한다', async () => {
    await create();
    expect(cookieEntries.size).toBe(1);
    expect(cookieEntries.get(SESSION_COOKIE)).toMatch(/^v1\./);
    expect(redisEntries.size).toBe(0);
    expect(cookieEntries.get(SESSION_COOKIE)).not.toContain('fake-access');
    expect([...redisEntries.keys()].join()).not.toContain(
      cookieEntries.get(SESSION_COOKIE)
    );
    expect((await serverAccessToken()).accessToken).toBe('fake-access');
    await deleteServerSession();
    expect(await readServerSession()).toBeNull();
  });
  it('진행 중인 토큰 갱신은 로그아웃된 세션을 복구하지 못한다', async () => {
    await create(0);
    jest.mocked(tokenRefresh).mockImplementationOnce(async () => {
      await deleteServerSession();
      return {
        accessToken: 'new-access',
        expiresAt: Date.now() + 3600000,
        refreshToken: undefined,
        scope: GOOGLE_AUTH_SCOPE,
      };
    });
    await expect(serverAccessToken()).rejects.toMatchObject({ status: 401 });
    expect(
      [...redisEntries.keys()].filter(key => key.includes(':session:'))
    ).toHaveLength(0);
  });
  it('Redis 설정 없이도 로그인하고 로그아웃할 수 있다', async () => {
    delete process.env.AUTH_REDIS_REST_URL;
    await create();
    expect((await serverAccessToken()).accessToken).toBe('fake-access');
    await deleteServerSession();
    expect(await readServerSession()).toBeNull();
  });
  it('설정 누락 시 기존 숏링크 Redis로 대체하지 않는다', () => {
    delete process.env.AUTH_REDIS_REST_URL;
    process.env.UPSTASH_REDIS_REST_URL = 'https://production.example.test';
    expect(() => authRedis()).toThrow(AuthStorageError);
  });
  it('개발 환경에서 운영 세션 namespace를 사용할 수 없다', () => {
    process.env.AUTH_REDIS_NAMESPACE = 'invia:production:auth';
    process.env.VERCEL_ENV = 'preview';
    expect(() => authKey('session:test')).toThrow(AuthStorageError);
  });
});
