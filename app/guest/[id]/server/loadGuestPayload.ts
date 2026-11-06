import 'server-only';

import { cache } from 'react';

import { parseGuestPayload } from '../validation/parseGuestPayload';

import { publicDataJsonUrl } from './guestDataUrl';

import type {
  GuestPayloadParseResult,
  GuestPayloadWarning,
  NormalizedGuestPayload,
} from '../validation/parseGuestPayload';

export type LoadGuestPayloadResult =
  | {
      status: 'ok';
      payload: NormalizedGuestPayload;
      warnings: GuestPayloadWarning[];
    }
  | {
      status: 'private';
    }
  | {
      status: 'not-found';
      reason: 'http_not_ok' | 'json_parse_failed' | 'invalid_payload';
      httpStatus?: number;
      details?: GuestPayloadParseResult;
    }
  | {
      status: 'unavailable';
      reason:
        | 'fetch_timeout'
        | 'fetch_failed'
        | 'http_unavailable';
    };

export const GUEST_PAYLOAD_FETCH_TIMEOUT_MS = 10_000;

type GuestResponse = {
  res: Response;
  raw: string | null;
};

export function isPrivateDriveStatus(status: number) {
  return status === 401 || status === 403 || status === 404;
}

export function isPrivateDriveBody(raw: string) {
  const head = raw.trimStart().slice(0, 120).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

export const loadGuestPayload = cache(
  async (id: string): Promise<LoadGuestPayloadResult> => {
    // generateMetadata와 page 렌더가 같은 공개 data.json 로딩 경로를 공유한다.
    const controller = new AbortController();
    let didTimeOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const responsePromise = (async (): Promise<GuestResponse> => {
      const res = await fetch(publicDataJsonUrl(id), {
        cache: 'no-store',
        next: { tags: [`invitation:${id}`] },
        signal: controller.signal,
      });

      if (!res.ok) return { res, raw: null };

      return { res, raw: await res.text() };
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        didTimeOut = true;
        controller.abort();
        reject(new Error('guest_payload_fetch_timeout'));
      }, GUEST_PAYLOAD_FETCH_TIMEOUT_MS);
    });

    let response: GuestResponse;
    try {
      response = await Promise.race([responsePromise, timeoutPromise]);
    } catch {
      return {
        status: 'unavailable',
        reason: didTimeOut ? 'fetch_timeout' : 'fetch_failed',
      };
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }

    const { res } = response;

    if (!res.ok) {
      if (isPrivateDriveStatus(res.status)) {
        return { status: 'private' };
      }

      if (res.status === 429 || res.status >= 500) {
        return { status: 'unavailable', reason: 'http_unavailable' };
      }

      return {
        status: 'not-found',
        reason: 'http_not_ok',
        httpStatus: res.status,
      };
    }

    const raw = response.raw ?? '';
    // Drive 비공개 파일은 JSON 대신 로그인/권한 HTML을 돌려줄 수 있다.
    if (isPrivateDriveBody(raw)) {
      return { status: 'private' };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { status: 'not-found', reason: 'json_parse_failed' };
    }

    const parsed = parseGuestPayload(payload);
    if (!parsed.ok) {
      return {
        status: 'not-found',
        reason: 'invalid_payload',
        details: parsed,
      };
    }

    // 이후 렌더러는 여기서 정규화된 payload만 받는다는 계약을 따른다.
    return { status: 'ok', payload: parsed.payload, warnings: parsed.warnings };
  }
);
