import type { GuestBlock } from '../types/guestTypes';

/**
 * 구글 드라이브(JSON)에서 받아온 편집 데이터가
 * 하객 페이지에서 사용하는 GuestBlock 배열 형식인지
 * 최소한으로 검사하는 런타임 타입 가드입니다.
 *
 * - 최상위가 배열인지 확인
 * - 각 요소가 객체인지 확인
 * - id, type, component가 문자열인지 확인
 * - props 키가 존재하는지 확인
 *
 * 검증에 실패하면 false를 반환하여,
 * 이후 notFound() 등 안전한 분기로 처리할 수 있습니다.
 */
export function isGuestBlocks(x: unknown): x is GuestBlock[] {
  return (
    Array.isArray(x) &&
    x.every(b => {
      if (!b || typeof b !== 'object') return false;
      const o = b as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.type === 'string' &&
        typeof o.component === 'string' &&
        'props' in o
      );
    })
  );
}
