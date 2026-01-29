import 'server-only';
import { cookies } from 'next/headers';

import { tokenRefresh } from './tokenRefresh';

export async function googleFetch(url: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken) throw new Error('유효한 요청이 아닙니다.');

  const doFetch = (token: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    if (!refreshToken) throw new Error('재로그인이 필요합니다.');

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

    res = await doFetch(refreshed.accessToken);
  }

  return res;
}
