import 'server-only';

import { Redis } from '@upstash/redis';

import { decryptRecord, encryptRecord } from './sessionCrypto';

export class AuthStorageError extends Error {
  status = 503;
  constructor() {
    super(
      '로그인 저장소에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
    );
  }
}

export function serverSessionsEnabled() {
  return process.env.AUTH_SERVER_SESSIONS === 'true';
}

export function authRedis() {
  const url = process.env.AUTH_REDIS_REST_URL;
  const token = process.env.AUTH_REDIS_REST_TOKEN;
  const namespace = process.env.AUTH_REDIS_NAMESPACE;
  if (!url || !token || !namespace || !/^[a-z0-9:_-]{3,80}$/i.test(namespace))
    throw new AuthStorageError();
  // Preview cannot accidentally read or mutate the production session namespace.
  if (
    process.env.VERCEL_ENV !== 'production' &&
    /(^|[:_-])(prod|production)([:_-]|$)/i.test(namespace)
  )
    throw new AuthStorageError();
  return {
    redis: new Redis({ url, token, automaticDeserialization: false }),
    namespace,
  };
}

export function authKey(suffix: string) {
  return `${authRedis().namespace}:${suffix}`;
}

export async function readAuthRecord<T>(key: string): Promise<T | null> {
  try {
    const value = await authRedis().redis.get<string>(key);
    return value ? decryptRecord<T>(value, key) : null;
  } catch {
    throw new AuthStorageError();
  }
}

export async function writeAuthRecord(
  key: string,
  value: unknown,
  ttlSeconds: number
) {
  try {
    await authRedis().redis.set(key, encryptRecord(value, key), {
      ex: Math.max(1, Math.floor(ttlSeconds)),
    });
  } catch {
    throw new AuthStorageError();
  }
}
