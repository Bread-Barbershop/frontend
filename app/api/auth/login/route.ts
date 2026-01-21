import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { generateOAuthState } from '@/app/api/auth/_lib/generateOAuthState';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from '@/app/api/auth/_lib/pkce';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID is missing' },
      { status: 500 }
    );
  }

  const redirectUri = `${origin}/api/auth/callback`;

  const state = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10분만 유효
  });

  cookieStore.set('pkce_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set(
    'scope',
    'openid https://www.googleapis.com/auth/drive.file'
  );
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return NextResponse.redirect(authUrl);
}
