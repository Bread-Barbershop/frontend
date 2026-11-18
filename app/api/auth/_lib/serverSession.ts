import 'server-only';

import { randomUUID } from 'node:crypto';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { AUTH_SESSION_MAX_AGE_SECONDS } from '@/shared/config/authSession';

import { hasRequiredDriveScope, hasExcessiveDriveScope } from './googleScopes';
import { decryptRecord, encryptRecord, sessionHash } from './sessionCrypto';
import { tokenRefresh } from './tokenRefresh';

export const SESSION_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Host-invia_session'
    : 'invia_session';
const SESSION_SECONDS = AUTH_SESSION_MAX_AGE_SECONDS;
type TokenRecord = {
  sessionId: string;
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
  const record: TokenRecord = {
    sessionId: randomUUID(),
    userId: sessionHash(`${process.env.GOOGLE_CLIENT_ID}:${user.sub}`),
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    sessionExpiresAt: Date.now() + SESSION_SECONDS * 1000,
    scope: tokens.scope,
  };
  (await cookies()).set(
    SESSION_COOKIE,
    encryptRecord(record, SESSION_COOKIE),
    cookieOptions(SESSION_SECONDS)
  );
}

function cookieOptions(maxAge: number) {
  return {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
  };
}

function openCookie(value?: string) {
  if (!value) return null;
  try {
    const record = decryptRecord<TokenRecord>(value, SESSION_COOKIE);
    return record.sessionExpiresAt > Date.now() &&
      hasRequiredDriveScope(record.scope) &&
      !hasExcessiveDriveScope(record.scope)
      ? record
      : null;
  } catch {
    return null;
  }
}

const renewalCookie = `${SESSION_COOKIE}_renewal`;
export const readServerSession = cache(async () => {
  const jar = await cookies();
  const original = openCookie(jar.get(SESSION_COOKIE)?.value);
  if (!original) return null;
  const renewal = openCookie(jar.get(renewalCookie)?.value);
  return {
    record: renewal?.sessionId === original.sessionId ? renewal : original,
  };
});

export async function requireServerSession() {
  const session = await readServerSession();
  if (!session) throw new SessionRequiredError();
  return session;
}

export const serverAccessToken = cache(async (forceRefresh = false) => {
  const { record } = await requireServerSession();
  if (!forceRefresh && record.expiresAt > Date.now() + 60_000) return record;
  const refreshed = await tokenRefresh(record.refreshToken).catch(error => {
    if (error instanceof Error && error.message === 'invalid_grant')
      throw new SessionRequiredError();
    throw error;
  });
  const next = {
    ...record,
    ...refreshed,
    refreshToken: refreshed.refreshToken ?? record.refreshToken,
    scope: refreshed.scope ?? record.scope,
  };
  if (!hasRequiredDriveScope(next.scope) || hasExcessiveDriveScope(next.scope))
    throw new SessionRequiredError();
  const jar = await cookies();
  if (
    openCookie(jar.get(SESSION_COOKIE)?.value)?.sessionId !== record.sessionId
  )
    throw new SessionRequiredError();
  // A late refresh can only update the renewal cookie, never recreate the login cookie.
  try {
    jar.set(
      renewalCookie,
      encryptRecord(next, SESSION_COOKIE),
      cookieOptions(
        Math.max(0, Math.floor((record.sessionExpiresAt - Date.now()) / 1000))
      )
    );
  } catch {
    // Server Components can use the refreshed token but cannot set response cookies.
  }
  return next;
});

export async function deleteServerSession() {
  const jar = await cookies();
  for (const name of [SESSION_COOKIE, renewalCookie])
    jar.set(name, '', cookieOptions(0));
}
