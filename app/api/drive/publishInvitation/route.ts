import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';

// publish API 요청 본문
type Body = { invitationFolderId: string };

// 단일 probe 실패 사유
type ProbeFailureReason =
  | 'http_not_ok'
  | 'json_parse_failed'
  | 'invalid_schema';

// 단일 probe 결과
type ProbeResult =
  | { ok: true; status: number }
  | {
      ok: false;
      status: number;
      reason: ProbeFailureReason;
      error?: string;
      rawPreview?: string;
    };

// 재시도 전체 결과
type ReadinessResult =
  | { ok: true; attempt: number }
  | { ok: false; attempts: number; lastProbe: ProbeResult | null };

const VERIFY_MAX_ATTEMPTS = 3;
const VERIFY_DELAY_MS = 350;

const guestPath = (dataJsonFileId: string) => `/guest/${dataJsonFileId}`;

const guestDataUrl = (dataJsonFileId: string) =>
  `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
    dataJsonFileId
  )}`;

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

// 게스트 페이지/태그 캐시를 함께 무효화
function revalidateGuestCaches(dataJsonFileId: string) {
  // 데이터 태그 캐시와 페이지 캐시에 남아 있을 수 있는
  // 오래된 정적 출력 결과를 모두 제거한다.
  revalidateTag(`invitation:${dataJsonFileId}`, 'max');
  revalidatePath(guestPath(dataJsonFileId));
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isNullableString(x: unknown): x is string | null {
  return x === null || typeof x === 'string';
}

// guest 페이지에서 요구하는 최소 JSON 형태 검사
function isGuestPayloadShape(x: unknown): boolean {
  if (!isRecord(x)) return false;
  if (!Array.isArray(x.blocks)) return false;
  if (!isRecord(x.bgm)) return false;

  const bgm = x.bgm;
  return (
    isNullableString(bgm.selectedBgmId) &&
    typeof bgm.isLoop === 'boolean' &&
    typeof bgm.volume === 'number' &&
    isNullableString(bgm.userBgmTitle) &&
    isNullableString(bgm.userBgmDuration) &&
    isNullableString(bgm.userBgmFileId)
  );
}

// 공개 data.json URL을 1회 조회하고 파싱/스키마까지 검증
async function probeGuestData(dataJsonFileId: string): Promise<ProbeResult> {
  const res = await fetch(guestDataUrl(dataJsonFileId), { cache: 'no-store' });

  if (!res.ok) {
    return { ok: false, status: res.status, reason: 'http_not_ok' };
  }

  const raw = await res.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      status: res.status,
      reason: 'json_parse_failed',
      rawPreview: raw.slice(0, 200),
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (!isGuestPayloadShape(parsed)) {
    return { ok: false, status: res.status, reason: 'invalid_schema' };
  }

  return { ok: true, status: res.status };
}

// guest 데이터가 준비될 때까지 짧게 재시도
async function waitUntilGuestReady(
  dataJsonFileId: string
): Promise<ReadinessResult> {
  let lastProbe: ProbeResult | null = null;

  for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt += 1) {
    const probe = await probeGuestData(dataJsonFileId);
    if (probe.ok) {
      return { ok: true, attempt };
    }

    lastProbe = probe;

    if (attempt < VERIFY_MAX_ATTEMPTS) {
      await sleep(VERIFY_DELAY_MS);
    }
  }

  return { ok: false, attempts: VERIFY_MAX_ATTEMPTS, lastProbe };
}

// "게스트 미준비" 공통 실패 응답
function notReadyResponse(params: {
  guestUrl: string;
  dataJsonFileId: string;
  verification: ReadinessResult;
}) {
  const { guestUrl, dataJsonFileId, verification } = params;

  return NextResponse.json(
    {
      ok: false,
      guestUrl,
      dataJsonFileId,
      error: 'guest_not_ready_after_publish',
      status: 502,
      details: verification,
    },
    { status: 502 }
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

  // 공개된 JSON 엔드포인트가 안정적으로 읽히는 것이 확인된 이후에만
  // 게스트 URL을 외부에 노출한다.
  const verification = await waitUntilGuestReady(dataJsonFileId);
  if (!verification.ok) {
    return notReadyResponse({ guestUrl, dataJsonFileId, verification });
  }

  return NextResponse.json({
    ok: true,
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

  return buildPublishSuccessResponse({ guestUrl, dataJsonFileId });
}
