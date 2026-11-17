import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  AuthStorageError,
  serverSessionsEnabled,
} from '@/app/api/auth/_lib/authStorage';
import {
  hasRequiredDriveScope,
  hasExcessiveDriveScope,
} from '@/app/api/auth/_lib/googleScopes';
import {
  createServerSession,
  deleteServerSession,
} from '@/app/api/auth/_lib/serverSession';

function oauthPopupResponse({
  messageType,
  reason,
  origin,
  title,
  body,
}: {
  messageType: 'GOOGLE_OAUTH_SUCCESS' | 'GOOGLE_OAUTH_ERROR';
  reason?: 'access_denied' | 'missing_drive_scope';
  origin: string;
  title: string;
  body: string;
}) {
  const payload = JSON.stringify({
    type: messageType,
    ...(reason ? { reason } : {}),
  });

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
    </style>
  </head>
  <body>
    <p>${body}</p>
    <script>
      (function () {
        try {
          if (window.opener) {
            window.opener.postMessage(${payload}, '${origin}');
          }
        } catch (e) {}
        window.close();
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function clearAuthCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set('access_token', '', { path: '/', maxAge: 0 });
  cookieStore.set('refresh_token', '', { path: '/', maxAge: 0 });
  cookieStore.set('granted_scopes', '', { path: '/', maxAge: 0 });
}

export async function GET(request: Request) {
  if (!serverSessionsEnabled()) {
    return NextResponse.json(
      { error: 'secure_login_unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateFromGoogle = searchParams.get('state');

  if (error) {
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', '', { path: '/', maxAge: 0 });
    cookieStore.set('pkce_code_verifier', '', { path: '/', maxAge: 0 });

    return oauthPopupResponse({
      messageType: 'GOOGLE_OAUTH_ERROR',
      reason: 'access_denied',
      origin,
      title: '로그인 취소',
      body: '로그인이 취소되었습니다. 창을 닫는 중...',
    });
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const stateInCookie = cookieStore.get('oauth_state')?.value;
  if (!stateFromGoogle || !stateInCookie || stateFromGoogle !== stateInCookie) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  const codeVerifier = cookieStore.get('pkce_code_verifier')?.value;
  if (!codeVerifier) {
    return NextResponse.json(
      { error: 'Missing PKCE code_verifier' },
      { status: 400 }
    );
  }

  cookieStore.set('oauth_state', '', { path: '/', maxAge: 0 });
  cookieStore.set('pkce_code_verifier', '', { path: '/', maxAge: 0 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json(tokenData, { status: tokenResponse.status });
    }

    if (
      !hasRequiredDriveScope(tokenData.scope) ||
      !tokenData.refresh_token ||
      hasExcessiveDriveScope(tokenData.scope)
    ) {
      clearAuthCookies(cookieStore);

      return oauthPopupResponse({
        messageType: 'GOOGLE_OAUTH_ERROR',
        reason: 'missing_drive_scope',
        origin,
        title: 'Google Drive 권한 필요',
        body: 'Google Drive 권한이 필요합니다. 권한을 모두 허용한 뒤 다시 로그인해 주세요.',
      });
    }

    await deleteServerSession();
    await createServerSession(tokenData);
    clearAuthCookies(cookieStore);
    return oauthPopupResponse({
      messageType: 'GOOGLE_OAUTH_SUCCESS',
      origin,
      title: '로그인 완료',
      body: '로그인 성공! 창을 닫는 중...',
    });
  } catch (error) {
    console.error('Token Exchange Error occurred');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: error instanceof AuthStorageError ? 503 : 500 }
    );
  }
}
