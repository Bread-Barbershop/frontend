import 'server-only';
import { refreshWithGoogle } from './tokenRefresh';

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

export async function googleFetch(
  cookieStore: CookieStoreLike,
  url: string,
  init: RequestInit = {}
) {
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken) throw new Error('unauthorized');

  const doFetch = (token: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });

  // 1차 요청
  let res = await doFetch(accessToken);

  // 401이면 refresh 후 1회 재시도
  // 여기도 실패했을때는 라우트핸들러에서 처리해야 함.
  if (res.status === 401) {
    if (!refreshToken) throw new Error('need_relogin');

    const refreshed = await refreshWithGoogle(refreshToken);
    res = await doFetch(refreshed.accessToken);

    return {
      res,
      refreshed: {
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
        refreshToken: refreshed.refreshToken,
      },
    };
  }

  return { res, refreshed: null as null };
}
