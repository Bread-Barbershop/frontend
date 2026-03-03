import 'server-only';

import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

export type PublishPermissionRetryResult =
  | { ok: true; attempt: number; ignored?: 'already_public' }
  | {
      ok: false;
      attempt: number;
      status?: number;
      details?: unknown;
      immediateFail?: boolean;
      error?: string;
    };

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 300;

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const IMMEDIATE_FAIL_STATUS = new Set([400, 401, 403, 404]);

const permissionCreateUrl = (folderId: string) =>
  `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    folderId
  )}/permissions?supportsAllDrives=true&sendNotificationEmail=false&fields=id`;

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

function retryDelayMs(attempt: number, baseDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 120);
  return exponential + jitter;
}

/**
 * 초대장 폴더를 공개(`anyone:reader`) 상태로 게시합니다. (재시도 횟수 제한 있음)
 *
 * 동작 방식:
 * - `409` 응답은 이미 공개 상태이므로 성공으로 간주합니다.
 * - 일시적인 오류(`429`, `5xx`) 및 요청 중 발생한 예외는 재시도합니다.
 * - 클라이언트/인증 오류(`400`, `401`, `403`, `404`)는 즉시 실패 처리합니다.
 *
 * @param invitationFolderId 대상 Drive 초대장 폴더 ID
 * @param options 재시도 관련 옵션 (기본값: 최대 3회 시도, 기본 지연 300ms)
 * @returns 시도 횟수 및 실패 메타데이터를 포함한 결과 객체
 */
export async function publishPermissionWithRetry(
  invitationFolderId: string,
  options?: { maxAttempts?: number; baseDelayMs?: number }
): Promise<PublishPermissionRetryResult> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let res: Response;
    try {
      res = await googleFetch(permissionCreateUrl(invitationFolderId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'anyone',
          role: 'reader',
          allowFileDiscovery: false,
        }),
        cache: 'no-store',
      });
    } catch (error) {
      if (attempt === maxAttempts) {
        return {
          ok: false,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        };
      }

      await sleep(retryDelayMs(attempt, baseDelayMs));
      continue;
    }

    if (res.status === 409) {
      return { ok: true, attempt, ignored: 'already_public' };
    }

    if (res.ok) {
      return { ok: true, attempt };
    }

    const details = await res.json().catch(() => undefined);

    if (IMMEDIATE_FAIL_STATUS.has(res.status)) {
      return {
        ok: false,
        attempt,
        status: res.status,
        details,
        immediateFail: true,
      };
    }

    const retryable = RETRYABLE_STATUS.has(res.status);
    if (!retryable || attempt === maxAttempts) {
      return {
        ok: false,
        attempt,
        status: res.status,
        details,
      };
    }

    await sleep(retryDelayMs(attempt, baseDelayMs));
  }

  return { ok: false, attempt: maxAttempts };
}
