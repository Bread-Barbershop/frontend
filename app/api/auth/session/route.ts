import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { AuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { tokenRefresh } from '@/app/api/auth/_lib/tokenRefresh';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function buildSession(
  hasAccessToken: boolean,
  hasRefreshToken: boolean
): AuthSession {
  return {
    isLoggedIn: hasAccessToken || hasRefreshToken,
    hasAccessToken,
    hasRefreshToken,
  };
}

function clearAuthCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set('access_token', '', {
    path: '/',
    maxAge: 0,
  });
  cookieStore.set('refresh_token', '', {
    path: '/',
    maxAge: 0,
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (accessToken) {
    return NextResponse.json(buildSession(true, Boolean(refreshToken)), {
      headers: NO_STORE_HEADERS,
    });
  }

  if (!refreshToken) {
    return NextResponse.json(buildSession(false, false), {
      headers: NO_STORE_HEADERS,
    });
  }

  try {
    const refreshed = await tokenRefresh(refreshToken);

    cookieStore.set('access_token', refreshed.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(refreshed.expiresAt),
      path: '/',
    });

    if (refreshed.refreshToken) {
      cookieStore.set('refresh_token', refreshed.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 180,
      });
    }

    return NextResponse.json(buildSession(true, true), {
      headers: NO_STORE_HEADERS,
    });
  } catch {
    clearAuthCookies(cookieStore);

    return NextResponse.json(buildSession(false, false), {
      headers: NO_STORE_HEADERS,
    });
  }
}
