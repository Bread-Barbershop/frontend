import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { serverSessionsEnabled } from '@/app/api/auth/_lib/authStorage';
import { deleteServerSession } from '@/app/api/auth/_lib/serverSession';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (
    request.headers.get('sec-fetch-site') === 'cross-site' ||
    (origin && origin !== new URL(request.url).origin)
  ) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (serverSessionsEnabled()) {
    try {
      await deleteServerSession();
    } catch {
      return NextResponse.json(
        { error: 'session_storage_unavailable' },
        { status: 503 }
      );
    }
  }
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
