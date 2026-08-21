import 'server-only';

import { NextResponse } from 'next/server';

import { captureDriveError } from '@/app/api/drive/_lib/captureDriveError';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { loadDashboardInvitations } from '@/app/dashboard/server/loadDashboardInvitations';

export const dynamic = 'force-dynamic';

const INVALID_REQUEST_MESSAGE = '유효한 요청이 아닙니다.';
const LOGIN_REQUIRED_MESSAGE = '로그인이 필요합니다.';
const RELOGIN_REQUIRED_MESSAGE = '재로그인이 필요합니다.';
const LOAD_INVITATIONS_ERROR_MESSAGE =
  '초대장 목록을 불러오는 중 오류가 발생했습니다.';

export async function GET() {
  try {
    const payload = await loadDashboardInvitations();

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    if (err instanceof DriveHttpError) {
      captureDriveError({
        error: err,
        operation: 'drive_dashboard_load',
        status: err.status,
      });
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    if (err instanceof Error && err.message === INVALID_REQUEST_MESSAGE) {
      return NextResponse.json(
        { message: INVALID_REQUEST_MESSAGE },
        { status: 400 }
      );
    }

    if (
      err instanceof Error &&
      (err.message === LOGIN_REQUIRED_MESSAGE ||
        err.message === RELOGIN_REQUIRED_MESSAGE)
    ) {
      return NextResponse.json(
        { message: RELOGIN_REQUIRED_MESSAGE },
        { status: 401 }
      );
    }

    captureDriveError({ error: err, operation: 'drive_dashboard_load' });

    return NextResponse.json(
      {
        message: LOAD_INVITATIONS_ERROR_MESSAGE,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
