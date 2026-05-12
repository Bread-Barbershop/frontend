import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import {
  guestPath,
  ReadinessResult,
  waitUntilGuestReady,
} from '@/app/api/drive/_lib/guestReadiness';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';

import { ensurePublishedJsonFile } from '../_lib/ensurePublishedJsonFile';

// publish API 요청 본문
type Body = { invitationFolderId: string };

const VERIFY_MAX_ATTEMPTS = 3;
const VERIFY_DELAY_MS = 350;

// 게스트 페이지/태그 캐시를 함께 무효화
function revalidateGuestCaches(dataJsonFileId: string) {
  // 데이터 태그 캐시와 페이지 캐시에 남아 있을 수 있는
  // 오래된 정적 출력 결과를 모두 제거한다.
  revalidateTag(`invitation:${dataJsonFileId}`, 'max');
  revalidatePath(guestPath(dataJsonFileId));
}

// 발행은 완료됐지만 공개 데이터 읽기 검증이 아직 안정화되지 않은 응답
function readinessPendingResponse(params: {
  guestUrl: string;
  dataJsonFileId: string;
  verification: ReadinessResult;
  ignored?: string;
}) {
  const { guestUrl, dataJsonFileId, verification, ignored } = params;

  return NextResponse.json(
    {
      ok: true,
      published: true,
      ready: false,
      guestUrl,
      dataJsonFileId,
      warning: 'guest_not_ready_after_publish',
      status: 202,
      details: verification,
      ...(ignored ? { ignored } : {}),
    },
    { status: 202 }
  );
}

// 퍼블리시 성공 후 공통 처리(캐시 무효화 + 준비 확인 + 성공 응답)
async function buildPublishSuccessResponse(params: {
  guestUrl: string;
  dataJsonFileId: string;
  ignored?: string;
}) {
  const { guestUrl, dataJsonFileId, ignored } = params;

  revalidateGuestCaches(dataJsonFileId);

  const verification = await waitUntilGuestReady(dataJsonFileId, {
    maxAttempts: VERIFY_MAX_ATTEMPTS,
    delayMs: VERIFY_DELAY_MS,
  });
  if (!verification.ok) {
    return readinessPendingResponse({
      guestUrl,
      dataJsonFileId,
      verification,
      ignored,
    });
  }

  return NextResponse.json({
    ok: true,
    published: true,
    ready: true,
    guestUrl,
    dataJsonFileId,
    ...(ignored ? { ignored } : {}),
  });
}

export async function POST(req: Request) {
  const { invitationFolderId } = (await req.json()) as Partial<Body>;

  if (!invitationFolderId) {
    return NextResponse.json(
      { ok: false, error: 'invitationFolderId required' },
      { status: 400 }
    );
  }

  const { dataJsonFileId } = await ensureDataJsonFile(invitationFolderId);
  const guestUrl = guestPath(dataJsonFileId);
  const permissionResult = await publishPermissionWithRetry(invitationFolderId);

  if (permissionResult.ok && permissionResult.ignored === 'already_public') {
    // 409는 "이미 공개 상태"이므로 발행 성공 흐름을 유지한다.
    await ensurePublishedJsonFile(invitationFolderId, guestUrl);
    return buildPublishSuccessResponse({
      guestUrl,
      dataJsonFileId,
      ignored: 'already_public',
    });
  }

  if (!permissionResult.ok) {
    const responseStatus =
      permissionResult.status && permissionResult.status >= 400
        ? permissionResult.status
        : 502;

    return NextResponse.json(
      {
        ok: false,
        guestUrl,
        dataJsonFileId,
        error: 'publish_permission_failed',
        status: responseStatus,
        attempts: permissionResult.attempt,
        immediateFail: Boolean(permissionResult.immediateFail),
        details: permissionResult.details,
        ...(permissionResult.error ? { cause: permissionResult.error } : {}),
      },
      { status: responseStatus }
    );
  }

  await ensurePublishedJsonFile(invitationFolderId, guestUrl);

  return buildPublishSuccessResponse({ guestUrl, dataJsonFileId });
}
