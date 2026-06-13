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
    const res = await fetch(publicDataJsonUrl(id), {
      next: { tags: [`invitation:${id}`] },
    });

    if (!res.ok) {
      if (isPrivateDriveStatus(res.status)) {
        return { status: 'private' };
      }

      return {
        status: 'not-found',
        reason: 'http_not_ok',
        httpStatus: res.status,
      };
    }

    const raw = await res.text();
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
