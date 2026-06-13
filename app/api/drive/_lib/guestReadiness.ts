import 'server-only';

import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

export type ProbeFailureReason =
  | 'fetch_failed'
  | 'fetch_timeout'
  | 'http_not_ok'
  | 'json_parse_failed'
  | 'invalid_schema';

export type ProbeResult =
  | { ok: true; status: number }
  | {
      ok: false;
      status: number;
      reason: ProbeFailureReason;
      error?: string;
      rawPreview?: string;
    };

export type ReadinessResult =
  | { ok: true; attempt: number }
  | { ok: false; attempts: number; lastProbe: ProbeResult | null };

export const guestPath = (dataJsonFileId: string) => `/guest/${dataJsonFileId}`;

const guestDataUrl = (dataJsonFileId: string) =>
  `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
    dataJsonFileId
  )}`;

const PROBE_FETCH_TIMEOUT_MS = 3000;

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export async function probeGuestData(
  dataJsonFileId: string
): Promise<ProbeResult> {
  // Drive 전파 지연은 HTTP status, HTML 응답, schema 불일치로 나타날 수 있어
  // 단순 fetch 성공이 아니라 실제 guest payload 형태까지 확인한다.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, PROBE_FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(guestDataUrl(dataJsonFileId), {
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      reason: isAbortError(error) ? 'fetch_timeout' : 'fetch_failed',
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeoutId);
  }

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

  if (!parseGuestPayload(parsed).ok) {
    return { ok: false, status: res.status, reason: 'invalid_schema' };
  }

  return { ok: true, status: res.status };
}

export async function waitUntilGuestReady(
  dataJsonFileId: string,
  options: { maxAttempts: number; delayMs: number }
): Promise<ReadinessResult> {
  const { maxAttempts, delayMs } = options;
  let lastProbe: ProbeResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const probe = await probeGuestData(dataJsonFileId);
    if (probe.ok) {
      return { ok: true, attempt };
    }

    lastProbe = probe;

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  return { ok: false, attempts: maxAttempts, lastProbe };
}
