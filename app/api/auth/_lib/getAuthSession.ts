import 'server-only';
import { cookies } from 'next/headers';

export type AuthSession = {
  isLoggedIn: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
};

export async function getAuthSession(): Promise<AuthSession> {
  const cookieStore = await cookies();

  const hasAccessToken = Boolean(cookieStore.get('access_token')?.value);
  const hasRefreshToken = Boolean(cookieStore.get('refresh_token')?.value);

  return {
    isLoggedIn: hasRefreshToken || hasAccessToken,
    hasAccessToken,
    hasRefreshToken,
  };
}
