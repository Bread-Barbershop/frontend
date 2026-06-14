import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();

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

  return NextResponse.json({ ok: true });
}
