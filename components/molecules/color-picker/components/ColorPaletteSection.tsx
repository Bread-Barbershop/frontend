'use client';

import { hsvaToHslaString } from '@uiw/color-convert';
import Saturation from '@uiw/react-color-saturation';

import { GlassPointer } from './GlassPointer';

import type { PickerHsva } from './colorPicker.types';

/**
 * 채도와 명도를 동시에 조절하는 메인 컬러 팔레트 영역입니다.
 *
 * Hue는 외부에서 이미 결정된 값을 사용하고,
 * 이 섹션은 Saturation 라이브러리의 결과를 받아 S/V 채널 중심으로 상위 상태를 갱신합니다.
 */
export function ColorPaletteSection({
  hsva,
  onChange,
}: {
  hsva: PickerHsva;
  onChange: (nextColor: Partial<PickerHsva>) => void;
}) {
  return (
    <div className="aspect-square w-full overflow-visible">
      <Saturation
        hsva={hsva}
        radius={12}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        pointer={({ left, top, color }) => (
          <GlassPointer
            left={left}
            top={top}
            color={color || hsvaToHslaString(hsva)}
          />
        )}
        onChange={newColor => {
          onChange(newColor);
        }}
      />
    </div>
  );
}
