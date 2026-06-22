'use client';

import { hsvaToHslaString } from '@uiw/color-convert';
import Alpha from '@uiw/react-color-alpha';

import { GlassPointer } from './GlassPointer';

import type { PickerHsva } from './colorPicker.types';
import type { GlassPointerSize } from './GlassPointer';
import type { PointerEventHandler } from 'react';

/**
 * 투명도 값을 조절하는 슬라이더 영역입니다.
 *
 * 좌측에는 현재 투명도 퍼센트를 표시하고,
 * 우측 슬라이더에서는 alpha 채널만 변경해 상위 상태에 반영합니다.
 */
export function ToneControlSection({
  hsva,
  transparencyPercent,
  pointerSize,
  onChange,
  onPointerDown,
}: {
  hsva: PickerHsva;
  transparencyPercent: number;
  pointerSize?: GlassPointerSize;
  onChange: (alpha: number) => void;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
}) {
  return (
    <div className="flex items-center gap-5" onPointerDown={onPointerDown}>
      <div className="flex h-8 w-13.5 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-[#f5f5f5] text-[14px] font-medium text-gray-700">
        {transparencyPercent}%
      </div>
      <div className="flex-1">
        <Alpha
          hsva={hsva}
          reverse
          radius={9999}
          width="100%"
          height={20}
          bgProps={{
            style: {
              boxShadow: 'inset 0 0 0 1px #EAEAEA',
            },
          }}
          pointer={({ left, top }) => (
            <GlassPointer
              left={left}
              top={top}
              color={hsvaToHslaString(hsva)}
              size={pointerSize}
              cursor="pointer"
            />
          )}
          onChange={newAlpha => {
            onChange(newAlpha.a);
          }}
        />
      </div>
    </div>
  );
}
