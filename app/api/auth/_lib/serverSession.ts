import 'server-only';

import { randomBytes } from 'node:crypto';

import { cookies } from 'next/headers';
import { cache } from 'react';

import {
  authKey,
  authRedis,
  AuthStorageError,
  readAuthRecord,
  writeAuthRecord,
} from './authStorage';
import { hasRequiredDriveScope, hasExcessiveDriveScope } from './googleScopes';
import { decryptRecord, encryptRecord, sessionHash } from './sessionCrypto';
import { tokenRefresh } from './tokenRefresh';

export const SESSION_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Host-invia_session'
    : 'invia_session';
const SESSION_SECONDS = 60 * 60 * 24 * 30;
type TokenRecord = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionExpiresAt: number;
  scope: string;
};

export class SessionRequiredError extends Error {
  status = 401;
  constructor() {
    super('auth_required');
  }
}

export async function createServerSession(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}) {
  if (
    !hasRequiredDriveScope(tokens.scope) ||
    hasExcessiveDriveScope(tokens.scope)
  )
    throw new SessionRequiredError();
  const identity = await fetch(
    'https://openidconnect.googleapis.com/v1/userinfo',
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    }
  );
  const user = await identity.json();
  if (!identity.ok || typeof user.sub !== 'string' || !user.sub)
    throw new SessionRequiredError();
  const sessionId = randomBytes(32).toString('base64url');
  const key = authKey(`session:${sessionHash(sessionId)}`);
  await writeAuthRecord(
    key,
    {
      userId: sessionHash(`${process.env.GOOGLE_CLIENT_ID}:${user.sub}`),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      sessionExpiresAt: Date.now() + SESSION_SECONDS * 1000,
    } satisfies TokenRecord,
    SESSION_SECONDS
  );
  (await cookies()).set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export const readServerSession = cache(async () => {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id || !/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
  const key = authKey(`session:${sessionHash(id)}`);
  const record = await readAuthRecord<TokenRecord>(key);
  if (
    !record ||
    record.sessionExpiresAt <= Date.now() ||
    !hasRequiredDriveScope(record.scope) ||
    hasExcessiveDriveScope(record.scope)
  )
    return null;
  return { key, record };
});

export async function requireServerSession() {
  const session = await readServerSession();
  if (!session) throw new SessionRequiredError();
  return session;
}

export async function serverAccessToken(forceRefresh = false) {
  const { key, record } = await requireServerSession();
  if (!forceRefresh && record.expiresAt > Date.now() + 60_000) return record;
  const { redis } = authRedis();
  const lockKey = `${key}:refresh`;
  const lockId = randomBytes(16).toString('hex');
  try {
    if (!(await redis.set(lockKey, lockId, { nx: true, ex: 20 })))
      throw new AuthStorageError();
    const encrypted = await redis.get<string>(key);
    if (!encrypted) throw new SessionRequiredError();
    const latest = decryptRecord<TokenRecord>(encrypted, key);
    if (
      latest.expiresAt > Date.now() + 60_000 &&
      latest.accessToken !== record.accessToken
    ) {
      Object.assign(record, latest);
      return record;
    }
    let refreshed;
    try {
      refreshed = await tokenRefresh(latest.refreshToken);
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid_grant') {
        await redis.del(key);
        throw new SessionRequiredError();
      }
      throw new AuthStorageError();
    }
    const next = {
      ...latest,
      ...refreshed,
      refreshToken: refreshed.refreshToken ?? latest.refreshToken,
      scope: refreshed.scope ?? latest.scope,
    };
    if (
      !hasRequiredDriveScope(next.scope) ||
      hasExcessiveDriveScope(next.scope)
    ) {
      await redis.del(key);
      throw new SessionRequiredError();
    }
    // Compare-and-set prevents an in-flight refresh from resurrecting a logged-out session.
    const updated = await redis.eval<[string, string], number>(
      "if redis.call('get',KEYS[1]) == ARGV[1] then redis.call('set',KEYS[1],ARGV[2],'KEEPTTL'); return 1 end return 0",
      [key],
      [encrypted, encryptRecord(next, key)]
    );
    if (!updated) throw new SessionRequiredError();
    Object.assign(record, next);
    return record;
  } catch (error) {
    if (error instanceof SessionRequiredError) throw error;
    throw new AuthStorageError();
  } finally {
    await redis
      .eval(
        "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) end return 0",
        [lockKey],
        [lockId]
      )
      .catch(() => undefined);
  }
}

export async function deleteServerSession() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (id) {
    try {
      await authRedis().redis.del(authKey(`session:${sessionHash(id)}`));
    } catch {
      throw new AuthStorageError();
    }
  }
  (await cookies()).set(SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
