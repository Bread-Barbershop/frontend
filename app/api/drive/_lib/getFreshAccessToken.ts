import 'server-only';
import { cookies } from 'next/headers';

import { tokenRefresh } from './tokenRefresh';

/**
 * 항상 "새 access token"을 발급받아 반환함.
 * - refresh_token 없으면 401
 * - access_token 쿠키도 같이 갱신
 */
export async function getFreshAccessToken(): Promise<{
  accessToken: string;
  expiresAt: number;
}> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    throw new Error('auth_required');
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
      });
    }

    return {
      accessToken: refreshed.accessToken,
      expiresAt: refreshed.expiresAt,
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'invalid_grant') {
      throw new Error('auth_required');
    }
    throw err;
  }
}
