'use client';

import { hexToHsva, hsvaToHex, validHex } from '@uiw/color-convert';
import ShadeSlider from '@uiw/react-color-shade-slider';
import Wheel from '@uiw/react-color-wheel';
import { useState } from 'react';

import type { Editor } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  initialHex?: string;
}

export default function SimpleWheelColorPicker({
  editor,
  initialHex = '#FF4D6D',
}: Props) {
  // HEX → HSVA 변환
  const [hsva, setHsva] = useState(() => hexToHsva(initialHex));

  const hex = hsvaToHex(hsva).toUpperCase();

  const applyColor = (nextHsva: typeof hsva) => {
    const nextHex = hsvaToHex(nextHsva).toUpperCase();
    editor?.chain().focus().setColor(nextHex).run();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-50 p-3 bg-white rounded-xl shadow-xl">
      {/* Wheel */}
      <Wheel
        color={hsva}
        width={160}
        height={160}
        onChange={color => {
          const next = { ...hsva, ...color.hsva };
          setHsva(next);
          applyColor(next);
        }}
      />

      {/* Shade Slider (명도 조절) */}
      <ShadeSlider
        hsva={hsva}
        radius={12}
        style={{
          width: '95%',
        }}
        onChange={shade => {
          const next = { ...hsva, ...shade };
          setHsva(next);
          applyColor(next);
        }}
      />

      {/* HEX 입력 */}
      <div className="flex w-full min-w-0 items-center gap-2">
        <label className="text-xs font-medium shrink-0">HEX</label>
        <input
          type="text"
          value={hex}
          maxLength={7}
          onChange={e => {
            let value = e.target.value.toUpperCase();

            if (!value.startsWith('#')) {
              value = '#' + value.replace('#', '');
            }

            if (validHex(value)) {
              const nextHsva = hexToHsva(value);
              setHsva(nextHsva);
              editor?.chain().focus().setColor(value).run();
            }
          }}
          className="min-w-0 flex-1 border-2 border-border-neutral rounded px-2 py-1 text-sm focus:outline-none focus:border-pink-300"
        />

        {/* 미리보기 */}
        <div
          className="w-10 h-8 shrink rounded"
          style={{ backgroundColor: hex }}
        />
      </div>
    </div>
  );
}
