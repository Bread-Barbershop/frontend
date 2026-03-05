import type {
  GuestBlock,
  GuestBgm,
  GuestMainPosterData,
  GuestPayload,
} from '../types/guestTypes';

/**
 * data.json이 게스트 렌더링에 필요한 "최상위 payload 객체" 형식인지 검증합니다.
 *
 * 기대 형식:
 * {
 *   blocks: GuestBlock[],
 *   bgm: {
 *     selectedBgmId: string | null,
 *     isLoop: boolean,
 *     volume: number,
 *     userBgmTitle: string | null,
 *     userBgmDuration: string | null,
 *     userBgmFileId: string | null
 *   }
 * }
 *
 * 검증 목적:
 * - 잘못된 JSON 구조로 인한 런타임 에러 방지
 * - 타입 가드 통과 후 페이지에서 안전하게 payload.blocks / payload.bgm 사용
 * - 실패 시 상위 레벨에서 notFound() 등으로 처리 가능
 */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isNullableString(x: unknown): x is string | null {
  return x === null || typeof x === 'string';
}

function isGuestBlock(x: unknown): x is GuestBlock {
  if (!isRecord(x)) return false;

  return (
    typeof x.id === 'string' &&
    typeof x.type === 'string' &&
    typeof x.component === 'string' &&
    'props' in x
  );
}

function isGuestBgm(x: unknown): x is GuestBgm {
  if (!isRecord(x)) return false;

  return (
    isNullableString(x.selectedBgmId) &&
    typeof x.isLoop === 'boolean' &&
    typeof x.volume === 'number' &&
    isNullableString(x.userBgmTitle) &&
    isNullableString(x.userBgmDuration) &&
    isNullableString(x.userBgmFileId)
  );
}

function isGuestMainPosterData(x: unknown): x is GuestMainPosterData {
  if (!isRecord(x)) return false;

  return (
    typeof x.version === 'string' &&
    Array.isArray(x.objects) &&
    x.objects.every(isRecord) &&
    (x.background === undefined || typeof x.background === 'string')
  );
  // 타입 검사 강화 필요함
}

export function isGuestPayload(x: unknown): x is GuestPayload {
  if (!isRecord(x)) return false;

  if (!Array.isArray(x.blocks)) return false;
  if (!x.blocks.every(isGuestBlock)) return false;
  if (!isGuestMainPosterData(x.mainPoster)) return false;

  return isGuestBgm(x.bgm);
}
