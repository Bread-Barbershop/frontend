/**
 * @jest-environment node
 */

import { getFreshAccessToken } from '@/app/api/drive/_lib/getFreshAccessToken';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/app/api/auth/_lib/tokenRefresh', () => ({
  tokenRefresh: jest.fn(),
}));

import { cookies } from 'next/headers';
import { tokenRefresh } from '@/app/api/auth/_lib/tokenRefresh';

type MockCookieStore = {
  get: jest.Mock;
  set: jest.Mock;
};

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

describe('getFreshAccessToken', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('clears granted_scopes and rejects when refreshed scope no longer includes Drive access', async () => {
    const cookieStore = createCookieStore({
      refresh_token: 'refresh-token-value',
      granted_scopes: 'openid https://www.googleapis.com/auth/drive.file',
    });

    (cookies as jest.Mock).mockResolvedValue(cookieStore);
    (tokenRefresh as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      expiresAt: Date.UTC(2026, 2, 21, 12, 0, 0),
      scope: 'openid',
    });

    await expect(getFreshAccessToken()).rejects.toThrow('auth_required');

    expect(tokenRefresh).toHaveBeenCalledWith('refresh-token-value');
    expect(cookieStore.set).toHaveBeenCalledWith('granted_scopes', '', {
      path: '/',
      maxAge: 0,
    });
    expect(cookieStore.set).not.toHaveBeenCalledWith(
      'access_token',
      'new-access-token',
      expect.anything()
    );
  });
});
