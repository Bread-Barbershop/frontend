import 'server-only';

import { NextResponse } from 'next/server';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { loadDashboardInvitations } from '@/app/dashboard/server/loadDashboardInvitations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await loadDashboardInvitations();

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    if (
      err instanceof Error &&
      (err.message === '유효한 요청이 아닙니다.' ||
        err.message === '?좏슚???붿껌???꾨떃?덈떎.')
    ) {
      return NextResponse.json(
        { message: '?좏슚???붿껌???꾨떃?덈떎.' },
        { status: 400 }
      );
    }

    if (
      err instanceof Error &&
      (err.message === '로그인이 필요합니다.' ||
        err.message === '?щ줈洹몄씤???꾩슂?⑸땲??')
    ) {
      return NextResponse.json(
        { message: '?щ줈洹몄씤???꾩슂?⑸땲??' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: '초대장 목록을 불러오는 중 오류가 발생했습니다.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
