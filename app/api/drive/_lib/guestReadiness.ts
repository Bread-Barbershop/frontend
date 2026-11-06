import 'server-only';

import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import {
  isDriveFileId,
  publicDriveFileUrl,
} from '@/shared/utils/media/driveImageUtils';

export type ProbeFailureReason =
  | 'fetch_failed'
  | 'fetch_timeout'
  | 'http_not_ok'
  | 'json_parse_failed'
  | 'invalid_schema'
  | 'body_read_failed'
  | 'thumbnail_fetch_failed'
  | 'thumbnail_http_not_ok'
  | 'thumbnail_not_image';

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

export async function probeGuestData(
  dataJsonFileId: string
): Promise<ProbeResult> {
  // Drive data와 대표 이미지 공개 URL이 실제 게스트 경로에서 읽히는지
  // 같은 익명 요청 조건으로 확인한다. 전체 검증은 하나의 deadline을 공유한다.
  const controller = new AbortController();
  let didTimeOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const probePromise = (async (): Promise<ProbeResult> => {
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
        reason: didTimeOut ? 'fetch_timeout' : 'fetch_failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, reason: 'http_not_ok' };
    }

    let raw: string;
    try {
      raw = await res.text();
    } catch (error) {
      return {
        ok: false,
        status: res.status,
        reason: didTimeOut ? 'fetch_timeout' : 'body_read_failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }

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

    const payloadResult = parseGuestPayload(parsed);
    if (!payloadResult.ok) {
      return { ok: false, status: res.status, reason: 'invalid_schema' };
    }

    const thumbnailFileId = payloadResult.payload.mainPoster?.thumbnailFileId;
    // Legacy payloads may contain a non-Drive URL. Do not fetch arbitrary URLs.
    if (thumbnailFileId && isDriveFileId(thumbnailFileId)) {
      let imageRes: Response;
      try {
        imageRes = await fetch(publicDriveFileUrl(thumbnailFileId), {
          cache: 'no-store',
          signal: controller.signal,
        });
      } catch (error) {
        return {
          ok: false,
          status: 0,
          reason: didTimeOut ? 'fetch_timeout' : 'thumbnail_fetch_failed',
          error: error instanceof Error ? error.message : String(error),
        };
      }

      const contentType = imageRes.headers.get('content-type')?.toLowerCase();
      const isImage = contentType?.startsWith('image/') ?? false;
      void imageRes.body?.cancel().catch(() => undefined);

      if (!imageRes.ok) {
        return {
          ok: false,
          status: imageRes.status,
          reason: 'thumbnail_http_not_ok',
        };
      }

      if (!isImage) {
        return {
          ok: false,
          status: imageRes.status,
          reason: 'thumbnail_not_image',
        };
      }
    }

    return { ok: true, status: res.status };
  })();

  const timeoutPromise = new Promise<ProbeResult>(resolve => {
    timeoutId = setTimeout(() => {
      didTimeOut = true;
      controller.abort();
      resolve({ ok: false, status: 0, reason: 'fetch_timeout' });
    }, PROBE_FETCH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([probePromise, timeoutPromise]);
  } catch (error) {
    return {
      ok: false,
      status: 0,
      reason: didTimeOut ? 'fetch_timeout' : 'fetch_failed',
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
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
