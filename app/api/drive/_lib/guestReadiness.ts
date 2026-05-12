import 'server-only';

import { isGuestPayload } from '@/app/guest/[id]/utils/guestBlockTypeGuards';

export type ProbeFailureReason =
  | 'fetch_failed'
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

export const guestPath = (dataJsonFileId: string) =>
  `/guest/${dataJsonFileId}`;

const guestDataUrl = (dataJsonFileId: string) =>
  `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
    dataJsonFileId
  )}`;

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

export async function probeGuestData(
  dataJsonFileId: string
): Promise<ProbeResult> {
  let res: Response;
  try {
    res = await fetch(guestDataUrl(dataJsonFileId), { cache: 'no-store' });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      reason: 'fetch_failed',
      error: error instanceof Error ? error.message : String(error),
    };
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

  if (!isGuestPayload(parsed)) {
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
