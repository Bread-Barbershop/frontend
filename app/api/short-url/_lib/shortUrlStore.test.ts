/**
 * @jest-environment node
 */

jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn(),
  },
}));

import {
  createShortGuestPath,
  deleteShortCodeMapping,
  getOrCreateShortCode,
  isShortUrlStoreConfigured,
  resolveShortCode,
} from './shortUrlStore';
import { Redis } from '@upstash/redis';

const originalEnv = process.env;
const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('shortUrlStore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    (Redis.fromEnv as jest.Mock).mockReturnValue(redisMock);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns fallback values when Upstash env is not configured', async () => {
    expect(isShortUrlStoreConfigured()).toBe(false);
    await expect(
      getOrCreateShortCode('invitation-folder-id', 'data-json-file-id')
    ).resolves.toBeNull();
    await expect(resolveShortCode('aB7kQ2x')).resolves.toBeNull();
    expect(Redis.fromEnv).not.toHaveBeenCalled();
  });

  it('resolves a short code through Redis', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com/';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    redisMock.get.mockResolvedValue('data-json-file-id');

    await expect(resolveShortCode('aB7kQ2x')).resolves.toBe(
      'data-json-file-id'
    );

    expect(Redis.fromEnv).toHaveBeenCalledTimes(1);
    expect(redisMock.get).toHaveBeenCalledWith('short:aB7kQ2x');
  });

  it('rejects codes outside the generated alphabet before Redis lookup', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com/';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    await expect(resolveShortCode('O0Il')).resolves.toBeNull();

    expect(Redis.fromEnv).not.toHaveBeenCalled();
    expect(redisMock.get).not.toHaveBeenCalled();
  });

  it('supports Vercel KV REST env names', async () => {
    process.env.KV_REST_API_URL = 'https://kv.example.com/';
    process.env.KV_REST_API_TOKEN = 'kv-token';
    redisMock.get.mockResolvedValue('data-json-file-id');

    await expect(resolveShortCode('aB7kQ2x')).resolves.toBe(
      'data-json-file-id'
    );

    expect(Redis.fromEnv).toHaveBeenCalledTimes(1);
    expect(redisMock.get).toHaveBeenCalledWith('short:aB7kQ2x');
  });

  it('uses KV env names when UPSTASH env names are present but empty', async () => {
    process.env.UPSTASH_REDIS_REST_URL = '';
    process.env.UPSTASH_REDIS_REST_TOKEN = '';
    process.env.KV_REST_API_URL = 'https://kv.example.com/';
    process.env.KV_REST_API_TOKEN = 'kv-token';
    redisMock.get.mockResolvedValue('data-json-file-id');

    await expect(resolveShortCode('aB7kQ2x')).resolves.toBe(
      'data-json-file-id'
    );

    expect(Redis.fromEnv).toHaveBeenCalledTimes(1);
    expect(redisMock.get).toHaveBeenCalledWith('short:aB7kQ2x');
  });

  it('reuses an existing short code for the same invitation folder', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    redisMock.get.mockResolvedValue('aB7kQ2x');
    redisMock.set.mockResolvedValue('OK');

    await expect(
      getOrCreateShortCode('invitation-folder-id', 'new-data-json-file-id')
    ).resolves.toEqual({
      shortCode: 'aB7kQ2x',
      guestPath: '/i/aB7kQ2x',
    });

    expect(redisMock.get).toHaveBeenCalledWith(
      'invite:invitation-folder-id:shortCode'
    );
    expect(redisMock.set).toHaveBeenCalledWith(
      'short:aB7kQ2x',
      'new-data-json-file-id'
    );
  });

  it('creates new short codes with four characters', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue('OK');

    const result = await getOrCreateShortCode(
      'invitation-folder-id',
      'data-json-file-id'
    );

    expect(result?.shortCode).toMatch(/^[A-Za-z0-9]{4}$/);
    expect(result?.guestPath).toBe(`/i/${result?.shortCode}`);
    expect(redisMock.set).toHaveBeenCalledWith(
      `short:${result?.shortCode}`,
      'data-json-file-id',
      { nx: true }
    );
  });

  it('deletes short URL mapping for an invitation folder', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    redisMock.get.mockResolvedValue('aB7kQ2x');
    redisMock.del.mockResolvedValue(2);

    await expect(deleteShortCodeMapping('invitation-folder-id')).resolves.toBe(
      true
    );

    expect(redisMock.get).toHaveBeenCalledWith(
      'invite:invitation-folder-id:shortCode'
    );
    expect(redisMock.del).toHaveBeenCalledWith(
      'invite:invitation-folder-id:shortCode',
      'short:aB7kQ2x'
    );
  });

  it('creates short guest paths under /i', () => {
    expect(createShortGuestPath('aB7kQ2x')).toBe('/i/aB7kQ2x');
  });
});
