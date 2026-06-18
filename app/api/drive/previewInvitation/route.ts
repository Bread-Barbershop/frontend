import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import {
  loadPreviewInvitationPayload,
  PreviewAccessError,
} from '@/app/api/drive/_lib/previewAccess';
import { getPreviewAuthErrorResponse } from '@/app/api/drive/_lib/previewAuth';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function jsonError(params: {
  status: number;
  message: string;
  userMessage: string;
  details?: unknown;
}) {
  return NextResponse.json(
    {
      ok: false,
      message: params.message,
      userMessage: params.userMessage,
      ...(params.details ? { details: params.details } : {}),
    },
    {
      status: params.status,
      headers: NO_STORE_HEADERS,
    }
  );
}

export async function GET(req: NextRequest) {
  const authError = await getPreviewAuthErrorResponse();
  if (authError) return authError;

  try {
    const folderId = req.nextUrl.searchParams.get('folderId') ?? '';
    // 공개 guest URL을 거치지 않고, 소유자 권한으로 비공개 data.json까지 읽어온다.
    const payload = await loadPreviewInvitationPayload(folderId);

    return NextResponse.json(payload, {
      headers: NO_STORE_HEADERS,
    });
  } catch (err) {
    if (err instanceof PreviewAccessError) {
      return jsonError({
        status: err.status,
        message: err.code,
        userMessage: err.userMessage,
        details: err.details,
      });
    }

    if (err instanceof DriveHttpError) {
      return jsonError({
        status: err.status,
        message: 'PREVIEW_UNKNOWN_ERROR',
        userMessage: '미리보기를 불러오는 중 오류가 발생했습니다.',
        details: err.details,
      });
    }

    return jsonError({
      status: 500,
      message: 'PREVIEW_UNKNOWN_ERROR',
      userMessage: '미리보기를 불러오는 중 오류가 발생했습니다.',
      details: err instanceof Error ? err.message : err,
    });
  }
}
