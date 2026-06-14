import 'server-only';
import { cookies } from 'next/headers';

import { hasRequiredDriveScope } from '@/app/api/auth/_lib/googleScopes';

export type AuthSession = {
  isLoggedIn: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasRequiredDriveScope: boolean;
};

export async function getAuthSession(): Promise<AuthSession> {
  const cookieStore = await cookies();

  const hasAccessToken = Boolean(cookieStore.get('access_token')?.value);
  const hasRefreshToken = Boolean(cookieStore.get('refresh_token')?.value);
  const hasRequiredScope = hasRequiredDriveScope(
    cookieStore.get('granted_scopes')?.value
  );

  return {
    isLoggedIn: hasRefreshToken && hasRequiredScope,
    hasAccessToken,
    hasRefreshToken,
    hasRequiredDriveScope: hasRequiredScope,
  };
}
