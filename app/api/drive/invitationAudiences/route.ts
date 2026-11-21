import 'server-only';

import { NextResponse } from 'next/server';

import { AudienceLinkStoreUnavailableError } from '@/app/api/drive/_lib/audienceLinkStore';
import { captureDriveError } from '@/app/api/drive/_lib/captureDriveError';
import { InvitationCloneError } from '@/app/api/drive/_lib/cloneDriveFiles';
import { isJsonRecord } from '@/app/api/drive/_lib/cloneInvitationData';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import {
  createInvitationAudience,
  getAudienceOptions,
  getInvitationAudiences,
  getInvitationPublicOrigin,
} from '@/app/api/drive/_lib/invitationAudiences';
import { PreviewAccessError } from '@/app/api/drive/_lib/previewAccess';
import {
  validateAudienceName,
  validateAudienceSlug,
} from '@/features/invitation/audiences/model';

export const maxDuration = 120;

const AUTH_ERRORS = new Set([
  'auth_required',
  'invalid_grant',
  '유효한 요청이 아닙니다.',
  '재로그인이 필요합니다.',
]);
const HEADERS = { 'Cache-Control': 'no-store' };

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function failure(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: HEADERS });
}

function handleFailure(error: unknown, operation: string) {
  if (
    (error instanceof Error && AUTH_ERRORS.has(error.message)) ||
    (error instanceof DriveHttpError && error.status === 401)
  ) {
    return failure('재로그인이 필요합니다.', 401);
  }
  if (error instanceof PreviewAccessError)
    return failure(error.userMessage, error.status);
  if (error instanceof InvitationCloneError)
    return failure(error.message, error.status);

  const status = error instanceof DriveHttpError ? error.status : undefined;
  captureDriveError({ error, operation, status });
  if (error instanceof AudienceLinkStoreUnavailableError) {
    return failure(
      '하객 그룹의 링크를 준비할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      503
    );
  }
  if (status === 403)
    return failure('Google Drive 접근 권한을 확인해 주세요.', 403);
  if (status === 404) return failure('초대장 파일을 찾을 수 없습니다.', 404);
  return failure('하객 그룹을 불러오지 못했습니다. 다시 시도해 주세요.', 502);
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const folderId = params.get('folderId');
  if (!isValidId(folderId)) return failure('초대장 정보를 확인해 주세요.', 400);

  try {
    const view = params.get('view');
    if (view === 'editor-options' || view === 'preview-options') {
      return NextResponse.json(
        { audiences: await getAudienceOptions(folderId, view) },
        { headers: HEADERS }
      );
    }
    return NextResponse.json(
      await getInvitationAudiences(folderId, getInvitationPublicOrigin(req)),
      { headers: HEADERS }
    );
  } catch (error) {
    return handleFailure(error, 'drive_audience_load');
  }
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (
    !isJsonRecord(body) ||
    !isValidId(body.folderId) ||
    !isValidId(body.sourceFolderId) ||
    !isValidId(body.requestId) ||
    typeof body.name !== 'string' ||
    typeof body.slug !== 'string'
  ) {
    return failure('하객 그룹 정보를 확인해 주세요.', 400);
  }

  const name = body.name.trim();
  const slug = body.slug.trim();
  const invalid = validateAudienceName(name) ?? validateAudienceSlug(slug);
  if (invalid) return failure(invalid, 400);

  try {
    return NextResponse.json(
      await createInvitationAudience({
        folderId: body.folderId,
        sourceFolderId: body.sourceFolderId,
        requestId: body.requestId,
        name,
        slug,
        publicOrigin: getInvitationPublicOrigin(req),
      }),
      { headers: HEADERS }
    );
  } catch (error) {
    return handleFailure(error, 'drive_audience_create');
  }
}
