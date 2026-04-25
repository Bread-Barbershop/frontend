import type { InputMode } from './colorPicker.types';

/**
 * 입력 모드 셀렉터에서 사용하는 고정 옵션 목록입니다.
 *
 * 현재 컬러피커는 HEX와 RGB 두 가지 입력 방식만 지원하므로
 * 이 상수를 단일 기준으로 사용해 셀렉터와 타입 간 불일치를 막습니다.
 */
export const INPUT_MODE_OPTIONS: ReadonlyArray<{
  label: string;
  value: InputMode;
}> = [
  { label: 'HEX', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
] as const;

/**
 * 컬러 히스토리에 보관할 최대 개수입니다.
 *
 * 화면에는 최대 2줄까지만 보여주지만, 저장 개수도 같은 기준에 맞춰 제한해
 * 불필요하게 오래된 색상이 계속 누적되지 않도록 합니다.
 */
export const MAX_COLOR_HISTORY_COUNT = 14;

/**
 * 컬러 히스토리 한 줄에 렌더링할 칸 수입니다.
 *
 * 현재 디자인은 7열 고정 레이아웃을 기준으로 잡혀 있으므로
 * 그리드 컬럼 수도 이 값을 기준으로 계산합니다.
 */
export const COLOR_HISTORY_COLUMN_COUNT = 7;
