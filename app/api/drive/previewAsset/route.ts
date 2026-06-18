import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import {
  assertDriveFileUnderInvitation,
  parsePreviewAssetKind,
  PreviewAccessError,
  validatePreviewAssetMimeType,
} from '@/app/api/drive/_lib/previewAccess';
import { getPreviewAuthErrorResponse } from '@/app/api/drive/_lib/previewAuth';

export const dynamic = 'force-dynamic';

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
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

function copyResponseHeaders(source: Headers, fallbackContentType: string) {
  const headers = new Headers();
  headers.set(
    'Content-Type',
    source.get('content-type') ?? fallbackContentType
  );
  headers.set('Cache-Control', 'private, max-age=300');

  // 오디오 미리보기는 브라우저가 Range 요청을 보낼 수 있어 관련 헤더를 가능한 유지한다.
  [
    'content-length',
    'etag',
    'last-modified',
    'accept-ranges',
    'content-range',
  ].forEach(name => {
    const value = source.get(name);
    if (value) headers.set(name, value);
  });

  return headers;
}

export async function GET(req: NextRequest) {
  const authError = await getPreviewAuthErrorResponse();
  if (authError) return authError;

  try {
    const fileId = req.nextUrl.searchParams.get('fileId') ?? '';
    const folderId = req.nextUrl.searchParams.get('folderId') ?? '';
    const kind = parsePreviewAssetKind(req.nextUrl.searchParams.get('kind'));
    // fileId가 요청한 초대장 하위에 있는지 확인한 뒤에만 Drive 원본을 프록시한다.
    const file = await assertDriveFileUnderInvitation(fileId, folderId);
    const mimeType = file.mimeType ?? '';

    validatePreviewAssetMimeType({ fileId, mimeType }, kind);

    const forwardHeaders = new Headers();
    const range = req.headers.get('range');
    if (range) forwardHeaders.set('range', range);

    const driveRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId
      )}?alt=media`,
      {
        cache: 'no-store',
        headers: forwardHeaders,
      }
    );

    if (!driveRes.ok) {
      return jsonError({
        status: 502,
        message: 'PREVIEW_ASSET_DOWNLOAD_FAILED',
        userMessage: '미리보기 파일을 불러오지 못했습니다.',
        details: await driveRes.json().catch(() => ({
          status: driveRes.status,
        })),
      });
    }

    return new Response(driveRes.body, {
      status: driveRes.status,
      headers: copyResponseHeaders(driveRes.headers, mimeType),
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
