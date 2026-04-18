'use client';

import { HexColorInput } from './HexColorInput';
import { InputModeSelector } from './InputModeSelector';
import { RgbColorInput } from './RgbColorInput';

import type { InputMode, PickerHsva } from './colorPicker.types';

/**
 * HEX, RGB 입력 필드와 모드 셀렉터를 묶는 컨버터 섹션입니다.
 *
 * 입력 모드 전환 자체는 여기서 처리하지 않고,
 * 상위에서 내려받은 `inputMode`에 따라 적절한 입력 컴포넌트만 조합합니다.
 */
export function ColorConverterSection({
  hsva,
  hex,
  inputMode,
  onInputModeChange,
  onHexChange,
  onRgbChange,
}: {
  hsva: PickerHsva;
  hex: string;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onHexChange: (hex: string) => void;
  onRgbChange: (nextColor: PickerHsva) => void;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <InputModeSelector value={inputMode} onChange={onInputModeChange} />

      <div className="flex-1">
        {inputMode === 'hex' ? (
          <HexColorInput value={hex} onChange={onHexChange} />
        ) : (
          <RgbColorInput hsva={hsva} onChange={onRgbChange} />
        )}
      </div>
    </div>
  );
}
