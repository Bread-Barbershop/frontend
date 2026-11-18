import 'server-only';
import { cookies } from 'next/headers';

import { hasRequiredDriveScope } from '@/app/api/auth/_lib/googleScopes';

import { serverSessionsEnabled } from './authStorage';
import { readServerSession } from './serverSession';

export type AuthSession = {
  isLoggedIn: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasRequiredDriveScope: boolean;
  userId?: string;
};

export async function getAuthSession(): Promise<AuthSession> {
  if (serverSessionsEnabled()) {
    const session = await readServerSession();
    return {
      isLoggedIn: Boolean(session),
      hasAccessToken: Boolean(session),
      hasRefreshToken: Boolean(session),
      hasRequiredDriveScope: Boolean(session),
      ...(session ? { userId: session.record.userId } : {}),
    };
  }
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
