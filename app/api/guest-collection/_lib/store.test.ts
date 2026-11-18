/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('@/app/api/auth/_lib/authStorage', () => ({
  authKey: (k: string) => k,
  authRedis: jest.fn(),
  readAuthRecord: jest.fn(),
}));
jest.mock('@/app/api/auth/_lib/serverSession', () => ({
  serverAccessToken: jest.fn(),
}));
jest.mock('@/app/api/auth/_lib/tokenRefresh', () => ({
  tokenRefresh: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/previewAccess', () => ({
  assertInvitationFolderAccess: jest.fn(async () => ({ rootFolderId: 'root' })),
}));
jest.mock('@/app/api/drive/_lib/ensureDataJsonFile', () => ({
  ensureDataJsonFile: jest.fn(async () => ({ dataJsonFileId: 'data' })),
}));
jest.mock('@/app/api/drive/_lib/saveJournal', () => ({
  withSaveLock: (_key: string, run: () => unknown) => run(),
}));
jest.mock('./resources', () => ({
  ...jest.requireActual('./resources'),
  ensureCollectionResource: jest.fn(async () => 'sheet'),
  enableGuestbook: jest.fn(async () => 0),
}));
import { authRedis, readAuthRecord } from '@/app/api/auth/_lib/authStorage';
import { GOOGLE_AUTH_SCOPE } from '@/app/api/auth/_lib/googleScopes';
import { serverAccessToken } from '@/app/api/auth/_lib/serverSession';
import { testEncryptionKey } from '@/app/api/auth/_lib/fixtures/session';
import { decryptRecord } from '@/app/api/auth/_lib/sessionCrypto';
import { tokenRefresh } from '@/app/api/auth/_lib/tokenRefresh';
import { configure, guestGoogle } from './store';

it('선택한 초대장만 마감까지 보관하고 편집자가 떠난 뒤 40일째에도 갱신하며, 끄면 즉시 삭제한다', async () => {
  const oldKey = process.env.AUTH_ENCRYPTION_KEY;
  const originalFetch = global.fetch;
  const start = Date.parse('2027-01-01T00:00:00+09:00');
  const saved = new Map<string, string>();
  const expiration = new Map<string, number>();
  const tx = {
    set: (key: string, value: string, options?: { pxat: number }) => {
      saved.set(key, value);
      if (options) expiration.set(key, options.pxat);
    },
    del: (key: string) => saved.delete(key),
    exec: async () => [],
  };
  jest.useFakeTimers({ now: start });
  try {
    process.env.AUTH_ENCRYPTION_KEY = testEncryptionKey;
    jest.mocked(authRedis).mockReturnValue({
      redis: {
        multi: () => tx,
        get: (k: string) => saved.get(k),
        eval: (_s: string, [k]: string[], [old, next]: string[]) => {
          if (old === saved.get(k)) saved.set(k, next);
          return saved.get(k);
        },
      },
    } as never);
    jest
      .mocked(readAuthRecord)
      .mockImplementation(async key =>
        saved.has(key) ? decryptRecord(saved.get(key)!, key) : null
      );
    jest
      .mocked(serverAccessToken)
      .mockResolvedValue({
        userId: 'owner',
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        scope: GOOGLE_AUTH_SCOPE,
        expiresAt: start + 3600000,
      } as never);
    const options = { eventDate: '2027-04-01', guestbook: true, photos: false };
    await expect(configure('root', options, false)).rejects.toMatchObject({
      status: 400,
    });
    expect(saved.size).toBe(0);
    await configure('root', options, true);
    const key = 'collection:grant:data';
    expect(saved.get(key)).not.toContain('mock-refresh');
    expect(expiration.get(key)).toBe(Date.parse('2027-04-05T00:00:00+09:00'));
    jest.mocked(serverAccessToken).mockClear();
    jest.setSystemTime(start + 40 * 86400000);
    jest
      .mocked(tokenRefresh)
      .mockResolvedValue({
        accessToken: 'renewed',
        expiresAt: Date.now() + 3600000,
        scope: GOOGLE_AUTH_SCOPE,
        refreshToken: undefined,
      });
    global.fetch = jest.fn(async () => Response.json({}));
    await (
      await guestGoogle('data')
    )('https://sheets.googleapis.com/');
    expect(tokenRefresh).toHaveBeenCalledWith('mock-refresh');
    expect(serverAccessToken).not.toHaveBeenCalled();
    await configure('root', { ...options, guestbook: false }, false);
    expect(saved.has(key)).toBe(false);
    expect(saved.has('collection:settings:data')).toBe(true);
  } finally {
    if (oldKey) process.env.AUTH_ENCRYPTION_KEY = oldKey;
    else delete process.env.AUTH_ENCRYPTION_KEY;
    global.fetch = originalFetch;
    jest.useRealTimers();
  }
});
