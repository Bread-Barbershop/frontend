'use client';

import { hsvaToHslaString } from '@uiw/color-convert';
import Hue from '@uiw/react-color-hue';

import { GlassPointer } from './GlassPointer';

/**
 * 색상환 기준의 Hue 값을 조절하는 슬라이더입니다.
 *
 * 팔레트와 동일한 포인터 스타일을 재사용해 시각적 일관성을 유지하고,
 * 사용자가 선택한 hue 값만 상위 컴포넌트로 전달합니다.
 */
export function ColorSlideSection({
  hue,
  onChange,
}: {
  hue: number;
  onChange: (hue: number) => void;
}) {
  return (
    <div className="w-full">
      <Hue
        hue={hue}
        width="100%"
        height={20}
        radius={9999}
        pointer={({ left, top }) => (
          <GlassPointer
            left={left}
            top={top}
            color={hsvaToHslaString({ h: hue, s: 100, v: 100, a: 1 })}
          />
        )}
        onChange={newHue => {
          onChange(newHue.h);
        }}
      />
    </div>
  );
}
