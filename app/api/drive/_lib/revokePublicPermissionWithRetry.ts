import 'server-only';

import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

export type RevokePublicPermissionRetryResult =
  | { ok: true; attempt: number; ignored?: 'not_public' }
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
const IMMEDIATE_FAIL_STATUS = new Set([400, 401, 403]);

const permissionsListUrl = (fileId: string) =>
  `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    fileId
  )}/permissions?supportsAllDrives=true&fields=permissions(id,type,role)`;

const permissionDeleteUrl = (fileId: string, permissionId: string) =>
  `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    fileId
  )}/permissions/${encodeURIComponent(permissionId)}?supportsAllDrives=true`;

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

function retryDelayMs(attempt: number, baseDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 120);
  return exponential + jitter;
}

async function findPublicPermissionId(fileId: string) {
  const res = await googleFetch(permissionsListUrl(fileId), {
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as {
    permissions?: Array<{ id?: string; type?: string; role?: string }>;
  };

  if (!res.ok) {
    return {
      ok: false as const,
      status: res.status,
      details: data,
      permissionId: null,
    };
  }

  const permissionId =
    data.permissions?.find(permission => permission.type === 'anyone')?.id ??
    null;

  return { ok: true as const, permissionId };
}

export async function revokePublicPermissionWithRetry(
  fileId: string,
  options?: { maxAttempts?: number; baseDelayMs?: number }
): Promise<RevokePublicPermissionRetryResult> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const found = await findPublicPermissionId(fileId);

  if (!found.ok) {
    return {
      ok: false,
      attempt: 1,
      status: found.status,
      details: found.details,
      immediateFail: IMMEDIATE_FAIL_STATUS.has(found.status),
    };
  }

  if (!found.permissionId) {
    return { ok: true, attempt: 1, ignored: 'not_public' };
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let res: Response;
    try {
      res = await googleFetch(permissionDeleteUrl(fileId, found.permissionId), {
        method: 'DELETE',
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

    if (res.status === 404) {
      return { ok: true, attempt, ignored: 'not_public' };
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
