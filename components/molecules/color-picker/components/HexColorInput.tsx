'use client';

import { validHex } from '@uiw/color-convert';
import { useState } from 'react';

/**
 * HEX 값을 직접 편집하는 단일 입력 필드입니다.
 *
 * 편집 중에는 사용자가 입력한 draft를 유지하고,
 * 유효한 HEX 형식이 완성되면 즉시 상위 컴포넌트로 색상 변경을 전달합니다.
 */
export function HexColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <input
      value={isEditing ? draft : value}
      onFocus={() => {
        setDraft(value);
        setIsEditing(true);
      }}
      onChange={event => {
        const nextValue = event.target.value
          .toUpperCase()
          .replace(/[^#0-9A-F]/g, '')
          .slice(0, 7);

        setDraft(nextValue);

        if (validHex(nextValue)) {
          onChange(nextValue);
        }
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
      className="h-8 w-full rounded-md border-0 bg-[#F5F5F5] px-3 text-center text-[14px] leading-5 text-text-primary outline-none"
      spellCheck={false}
      inputMode="text"
      aria-label="Hex color value"
    />
  );
}
