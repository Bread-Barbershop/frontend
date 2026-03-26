'use client';

import { hexToHsva, hsvaToHex, validHex } from '@uiw/color-convert';
import ShadeSlider from '@uiw/react-color-shade-slider';
import Wheel from '@uiw/react-color-wheel';
import { type RefObject, useEffect, useRef, useState } from 'react';

interface Props {
  initialHex?: string;
  onClose?: () => void;
  onChange: (hex: string) => void;
  containerRef?: RefObject<HTMLElement | null>;
}

export default function SimpleWheelColorPicker({
  initialHex = '#FF4D6D',
  onClose,
  onChange,
  containerRef,
}: Props) {
  // HEX → HSVA 변환
  const [hsva, setHsva] = useState(() => hexToHsva(initialHex));

  const pickerRef = useRef<HTMLDivElement>(null);

  const hex = hsvaToHex(hsva).toUpperCase();

  useEffect(() => {
    if (!onClose) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (pickerRef.current?.contains(target)) return;
      if (containerRef?.current?.contains(target)) return;

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, containerRef]);

  return (
    <div
      ref={pickerRef}
      className="flex flex-col items-center justify-center gap-2 w-50 p-3 bg-white rounded-xl shadow-xl"
    >
      {/* Wheel */}
      <Wheel
        color={hsva}
        width={160}
        height={160}
        onChange={color => {
          const next = { ...hsva, ...color.hsva };
          setHsva(next);
          onChange(hex);
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
          onChange(hex);
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
              onChange(hex);
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
