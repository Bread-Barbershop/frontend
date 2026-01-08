import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateFromGoogle = searchParams.get('state');

  if (error) {
    return NextResponse.json(
      { error: `Google Auth Error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const stateInCookie = cookieStore.get('oauth_state')?.value;
  if (!stateFromGoogle || !stateInCookie || stateFromGoogle !== stateInCookie) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  cookieStore.set('oauth_state', '', { path: '/', maxAge: 0 });

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
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json(tokenData, { status: tokenResponse.status });
    }

    // 브라우저에 쿠키 심기.
    const isProd = process.env.NODE_ENV === 'production';

    // Access Token 저장
    cookieStore.set('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: tokenData.expires_in,
    });

    // Refresh Token 저장
    if (tokenData.refresh_token) {
      cookieStore.set('refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 180, // 180일
      });
    }

    return NextResponse.redirect(`${origin}/`);
  } catch (_err) {
    console.error('Token Exchange Error occurred');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
