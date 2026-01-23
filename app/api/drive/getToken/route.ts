import 'server-only';
import { NextResponse } from 'next/server';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { getFreshAccessToken } from '@/app/api/drive/_lib/getFreshAccessToken';

export async function POST() {
  try {
    const { accessToken, expiresAt } = await getFreshAccessToken();

    return NextResponse.json({ accessToken, expiresAt });
  } catch (err) {
    if (err instanceof Error && err.message === 'auth_required') {
      return NextResponse.json(
        { message: '재로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        message: '알 수 없는 오류',
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
