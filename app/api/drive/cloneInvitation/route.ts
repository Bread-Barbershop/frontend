import 'server-only';

import { NextResponse } from 'next/server';

import { captureDriveError } from '@/app/api/drive/_lib/captureDriveError';
import { InvitationCloneError } from '@/app/api/drive/_lib/cloneDriveFiles';
import { cloneInvitation } from '@/app/api/drive/_lib/cloneInvitation';
import { isJsonRecord } from '@/app/api/drive/_lib/cloneInvitationData';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { PreviewAccessError } from '@/app/api/drive/_lib/previewAccess';

export const maxDuration = 120;

const VALID_ID = /^[A-Za-z0-9_-]{1,128}$/;
const AUTH_ERRORS = new Set([
  'auth_required',
  'invalid_grant',
  '유효한 요청이 아닙니다.',
  '재로그인이 필요합니다.',
]);

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (
    !isJsonRecord(body) ||
    typeof body.folderId !== 'string' ||
    typeof body.requestId !== 'string' ||
    !VALID_ID.test(body.folderId) ||
    !VALID_ID.test(body.requestId)
  ) {
    return failure('복제할 초대장 정보를 확인해 주세요.', 400);
  }

  try {
    const invite = await cloneInvitation({
      folderId: body.folderId,
      requestId: body.requestId,
      publicOrigin:
        process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin,
    });
    return NextResponse.json({ success: true, invite });
  } catch (error) {
    if (
      (error instanceof Error && AUTH_ERRORS.has(error.message)) ||
      (error instanceof DriveHttpError && error.status === 401)
    ) {
      return failure('재로그인이 필요합니다.', 401);
    }
    if (error instanceof InvitationCloneError) {
      return failure(error.message, error.status);
    }
    if (error instanceof PreviewAccessError) {
      return failure(error.userMessage, error.status);
    }

    const driveStatus =
      error instanceof DriveHttpError ? error.status : undefined;
    captureDriveError({
      error,
      operation: 'drive_clone_invitation',
      status: driveStatus,
    });
    if (driveStatus === 403) {
      return failure('복제에 필요한 Google Drive 권한을 확인해 주세요.', 403);
    }
    if (driveStatus === 404) {
      return failure('복제할 초대장 파일을 찾을 수 없습니다.', 404);
    }
    if (driveStatus === 429) {
      return failure('잠시 후 초대장 복제를 다시 시도해 주세요.', 429);
    }
    return failure('초대장을 복제하지 못했습니다. 다시 시도해 주세요.', 502);
  }
}
