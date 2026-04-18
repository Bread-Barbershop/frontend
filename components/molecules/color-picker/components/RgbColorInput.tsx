'use client';

import { hsvaToRgba, rgbaToHsva } from '@uiw/color-convert';
import { useState } from 'react';

import type { PickerHsva } from './colorPicker.types';

/**
 * RGB 값을 세 칸으로 나누어 편집하는 입력 필드입니다.
 *
 * 각 칸은 독립적으로 draft를 가질 수 있지만,
 * 실제 색상 반영은 현재 HSVA 값을 RGBA로 변환한 뒤 수정된 채널만 교체해서 처리합니다.
 * 이렇게 하면 다른 채널 값이 예상치 않게 덮어써지지 않습니다.
 */
export function RgbColorInput({
  hsva,
  onChange,
}: {
  hsva: PickerHsva;
  onChange: (nextColor: PickerHsva) => void;
}) {
  const rgba = hsvaToRgba(hsva);
  const [draft, setDraft] = useState({
    r: String(rgba.r),
    g: String(rgba.g),
    b: String(rgba.b),
  });
  const [activeChannel, setActiveChannel] = useState<'r' | 'g' | 'b' | null>(
    null
  );

  const handleChannelChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const sanitizedValue = value.replace(/\D/g, '').slice(0, 3);
    const nextDraft = { ...draft, [channel]: sanitizedValue };
    setDraft(nextDraft);

    if (sanitizedValue === '') return;

    const nextChannelValue = Number(sanitizedValue);
    if (Number.isNaN(nextChannelValue) || nextChannelValue < 0) return;

    onChange(
      rgbaToHsva({
        r: channel === 'r' ? Math.min(255, nextChannelValue) : rgba.r,
        g: channel === 'g' ? Math.min(255, nextChannelValue) : rgba.g,
        b: channel === 'b' ? Math.min(255, nextChannelValue) : rgba.b,
        a: rgba.a,
      }) as PickerHsva
    );
  };

  return (
    <div className="flex h-8 w-full overflow-hidden rounded-lg bg-[#F5F5F5]">
      {(['r', 'g', 'b'] as const).map((channel, index) => (
        <div key={channel} className="flex flex-1 items-center">
          <input
            value={
              activeChannel === channel ? draft[channel] : String(rgba[channel])
            }
            onFocus={() => {
              setDraft({
                r: String(rgba.r),
                g: String(rgba.g),
                b: String(rgba.b),
              });
              setActiveChannel(channel);
            }}
            onChange={event => {
              handleChannelChange(channel, event.target.value);
            }}
            onBlur={() => {
              setActiveChannel(null);
            }}
            className="h-full w-full border-0 bg-transparent px-2 text-center text-[14px] leading-5 text-text-primary outline-none"
            inputMode="numeric"
            aria-label={`${channel.toUpperCase()} color value`}
          />
          {index < 2 && <div className="h-full w-0.5 bg-white" />}
        </div>
      ))}
    </div>
  );
}
