'use client';

import { hexToHsva, hsvaToHex, validHex } from '@uiw/color-convert';
import { useEffect, useState } from 'react';

import { ColorConverterSection } from './components/ColorConverterSection';
import { ColorHistorySection } from './components/ColorHistorySection';
import { ColorPaletteSection } from './components/ColorPaletteSection';
import { MAX_COLOR_HISTORY_COUNT } from './components/colorPicker.constants';
import { ColorSlideSection } from './components/ColorSlideSection';
import { ToneControlSection } from './components/ToneControlSection';

import type {
  ColorPickerChange,
  ColorPickerValue,
  InputMode,
  PickerHsva,
} from './components/colorPicker.types';

/**
 * 새 컬러피커의 상태와 각 세부 섹션을 조합하는 루트 컴포넌트입니다.
 *
 * 이 컴포넌트는 두 가지 방식으로 사용할 수 있습니다.
 * 1. `defaultValue`만 넘겨 내부 상태로 동작하는 비제어형 사용
 * 2. `value`와 `onChange`를 함께 넘겨 부모가 값을 소유하는 제어형 사용
 *
 * 따라서 다른 폼 컴포넌트, 설정 패널, 모달 안에 포함했을 때
 * 현재 선택된 색상을 부모 컴포넌트로 바로 반환하는 구조로 사용할 수 있습니다.
 */
function NewColorPicker({
  value,
  defaultValue,
  onChange,
}: {
  value?: ColorPickerValue;
  defaultValue?: ColorPickerValue;
  onChange?: (nextColor: ColorPickerChange) => void;
}) {
  const resolvedDefaultValue = resolveColorValue(defaultValue);
  const [internalHsva, setInternalHsva] = useState<PickerHsva>(
    resolvedDefaultValue ?? { h: 0, s: 0, v: 68, a: 1 }
  );
  const [inputMode, setInputMode] = useState<InputMode>('hex');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const controlledHsva = resolveColorValue(value);
  const hsva = controlledHsva ?? internalHsva;
  const transparencyPercent = Math.round((1 - hsva.a) * 100);
  const hex = hsvaToHex(hsva).toUpperCase();

  /**
   * 현재 색상을 단일 진입점으로 갱신합니다.
   *
   * 비제어형일 때는 내부 상태를 직접 갱신하고,
   * 제어형일 때는 내부 상태를 건드리지 않고 `onChange`만 통해 부모에 변경 사실을 알립니다.
   */
  const applyHsva = (nextHsva: PickerHsva) => {
    if (!controlledHsva) {
      setInternalHsva(nextHsva);
    }

    onChange?.({
      hsva: nextHsva,
      hex: hsvaToHex(nextHsva).toUpperCase(),
    });
  };

  /**
   * HSVA 일부 채널만 바꾸는 섹션들을 위해 부분 업데이트를 병합합니다.
   */
  const mergeHsva = (nextColor: Partial<PickerHsva>) => {
    applyHsva({ ...hsva, ...nextColor });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setColorHistory(prev =>
        [hex, ...prev.filter(color => color !== hex)].slice(
          0,
          MAX_COLOR_HISTORY_COUNT
        )
      );
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hex]);

  return (
    <div className="box-border flex w-93.75 flex-col gap-5 bg-white px-5 py-3.5">
      {/* Color palette */}
      <ColorPaletteSection
        hsva={hsva}
        onChange={nextColor => {
          mergeHsva(nextColor);
        }}
      />

      {/* Color slide */}
      <ColorSlideSection
        hue={hsva.h}
        onChange={hue => {
          mergeHsva({ h: hue });
        }}
      />

      {/* Tone control */}
      <ToneControlSection
        hsva={hsva}
        transparencyPercent={transparencyPercent}
        onChange={alpha => {
          mergeHsva({ a: alpha });
        }}
      />

      {/* HEX RGB converter */}
      <ColorConverterSection
        hsva={hsva}
        hex={hex}
        inputMode={inputMode}
        onInputModeChange={setInputMode}
        onHexChange={nextHex => {
          applyHsva(hexToHsva(nextHex) as PickerHsva);
        }}
        onRgbChange={nextColor => {
          applyHsva(nextColor);
        }}
      />

      {/* Color history */}
      <ColorHistorySection
        colorHistory={colorHistory}
        onChange={nextColor => {
          applyHsva(nextColor);
        }}
      />
    </div>
  );
}

/**
 * 외부에서 받은 색상 값을 내부 표준 형식인 HSVA로 정규화합니다.
 *
 * - HEX 문자열이면 유효성 검사 후 HSVA로 변환합니다.
 * - 이미 HSVA 객체면 그대로 사용합니다.
 * - 잘못된 문자열이면 `undefined`를 반환해 기본값 흐름으로 되돌립니다.
 */
function resolveColorValue(
  value?: ColorPickerValue
): PickerHsva | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return validHex(value) ? (hexToHsva(value) as PickerHsva) : undefined;
  }

  return value;
}

export default NewColorPicker;
