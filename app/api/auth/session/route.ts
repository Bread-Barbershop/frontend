import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { AuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { hasRequiredDriveScope } from '@/app/api/auth/_lib/googleScopes';
import { tokenRefresh } from '@/app/api/auth/_lib/tokenRefresh';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function buildSession(
  hasAccessToken: boolean,
  hasRefreshToken: boolean,
  hasRequiredScope: boolean
): AuthSession {
  return {
    isLoggedIn: hasRefreshToken && hasRequiredScope,
    hasAccessToken,
    hasRefreshToken,
    hasRequiredDriveScope: hasRequiredScope,
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
  cookieStore.set('granted_scopes', '', {
    path: '/',
    maxAge: 0,
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const grantedScopes = cookieStore.get('granted_scopes')?.value;
  const hasRequiredScope = hasRequiredDriveScope(grantedScopes);

  if (!refreshToken || !hasRequiredScope) {
    if (accessToken || refreshToken || grantedScopes) {
      clearAuthCookies(cookieStore);
    }

    return NextResponse.json(buildSession(false, false, false), {
      headers: NO_STORE_HEADERS,
    });
  }

  if (accessToken) {
    return NextResponse.json(buildSession(true, true, true), {
      headers: NO_STORE_HEADERS,
    });
  }

  try {
    const refreshed = await tokenRefresh(refreshToken);

    if (
      refreshed.scope !== undefined &&
      !hasRequiredDriveScope(refreshed.scope)
    ) {
      clearAuthCookies(cookieStore);

      return NextResponse.json(buildSession(false, false, false), {
        headers: NO_STORE_HEADERS,
      });
    }

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

    if (refreshed.scope) {
      cookieStore.set('granted_scopes', refreshed.scope, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 180,
      });
    }

    return NextResponse.json(buildSession(true, true, true), {
      headers: NO_STORE_HEADERS,
    });
  } catch {
    clearAuthCookies(cookieStore);

    return NextResponse.json(buildSession(false, false, false), {
      headers: NO_STORE_HEADERS,
    });
  }
}
