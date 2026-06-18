import 'server-only';

import { NextResponse } from 'next/server';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { getFreshAccessToken } from '@/app/api/drive/_lib/getFreshAccessToken';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function jsonError(params: {
  status: number;
  message: string;
  userMessage: string;
}) {
  return NextResponse.json(
    {
      ok: false,
      message: params.message,
      userMessage: params.userMessage,
    },
    {
      status: params.status,
      headers: NO_STORE_HEADERS,
    }
  );
}

/**
 * 대시보드 미리보기 API는 로그인한 소유자의 Drive 권한으로만 동작한다.
 * 여기서 인증/권한/토큰 갱신을 먼저 끝내고, 실제 Drive 파일 조회는 각 API에서 수행한다.
 */
export async function getPreviewAuthErrorResponse() {
  const session = await getAuthSession();

  if (!session.hasRefreshToken) {
    return jsonError({
      status: 401,
      message: 'LOGIN_REQUIRED',
      userMessage: '로그인이 필요합니다. 다시 로그인해 주세요.',
    });
  }

  if (!session.hasRequiredDriveScope) {
    return jsonError({
      status: 403,
      message: 'DRIVE_SCOPE_REQUIRED',
      userMessage: '초대장 미리보기를 위해 Google Drive 권한이 필요합니다.',
    });
  }

  try {
    await getFreshAccessToken();
  } catch {
    return jsonError({
      status: 401,
      message: 'RELOGIN_REQUIRED',
      userMessage: 'Google Drive 연결이 만료되었습니다. 다시 로그인해 주세요.',
    });
  }

  return null;
}
