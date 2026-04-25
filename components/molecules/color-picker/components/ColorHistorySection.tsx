'use client';

import { hexToHsva } from '@uiw/color-convert';

import {
  COLOR_HISTORY_COLUMN_COUNT,
  MAX_COLOR_HISTORY_COUNT,
} from './colorPicker.constants';

import type { PickerHsva } from './colorPicker.types';

/**
 * 최근 선택한 색상을 최대 두 줄까지 보여주는 히스토리 영역입니다.
 *
 * 현재 디자인은 7열 x 2행을 기준으로 고정되어 있으며,
 * 각 칩을 클릭하면 해당 HEX 값을 다시 HSVA로 변환해 상위 상태에 적용합니다.
 */
export function ColorHistorySection({
  colorHistory,
  columnCount = COLOR_HISTORY_COLUMN_COUNT,
  maxCount = MAX_COLOR_HISTORY_COUNT,
  onChange,
}: {
  colorHistory: string[];
  columnCount?: number;
  maxCount?: number;
  onChange: (nextColor: PickerHsva) => void;
}) {
  return (
    <div
      className="grid gap-2 overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {colorHistory.slice(0, maxCount).map(color => (
        <button
          key={color}
          type="button"
          className="h-8 w-8 rounded-lg border border-[#EAEAEA] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
          style={{ backgroundColor: color }}
          onClick={() => {
            onChange(hexToHsva(color) as PickerHsva);
          }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}
