'use client';

import { hexToHsva, hsvaToHex, validHex } from '@uiw/color-convert';
import { useEffect, useState } from 'react';

import { ColorConverterSection } from './components/ColorConverterSection';
import { ColorHistorySection } from './components/ColorHistorySection';
import { ColorPaletteSection } from './components/ColorPaletteSection';
import {
  COLOR_HISTORY_COLUMN_COUNT,
  MAX_COLOR_HISTORY_COUNT,
} from './components/colorPicker.constants';
import { ColorSlideSection } from './components/ColorSlideSection';
import { ToneControlSection } from './components/ToneControlSection';

import type {
  ColorPickerChange,
  ColorPickerValue,
  InputMode,
  PickerHsva,
} from './components/colorPicker.types';
import type { GlassPointerSize } from './components/GlassPointer';

export type ColorPickerBaseProps = {
  value?: ColorPickerValue;
  defaultValue?: ColorPickerValue;
  onChange?: (nextColor: ColorPickerChange) => void;
  paletteClassName?: string;
  pointerSize?: GlassPointerSize;
  historyColumnCount?: number;
  maxHistoryCount?: number;
};

function ColorPickerBase({
  value,
  defaultValue,
  onChange,
  paletteClassName,
  pointerSize,
  historyColumnCount = COLOR_HISTORY_COLUMN_COUNT,
  maxHistoryCount = MAX_COLOR_HISTORY_COUNT,
}: ColorPickerBaseProps) {
  const resolvedDefaultValue = resolveColorValue(defaultValue);
  const resolvedControlledValue = resolveColorValue(value);
  const initialHsva =
    resolvedControlledValue ??
    resolvedDefaultValue ??
    { h: 0, s: 0, v: 68, a: 1 };
  const [internalHsva, setInternalHsva] =
    useState<PickerHsva>(initialHsva);
  const [inputMode, setInputMode] = useState<InputMode>('hex');
  const [colorHistory, setColorHistory] = useState<string[]>(() => [
    hsvaToHex(initialHsva).toUpperCase(),
  ]);
  const controlledHsva = resolvedControlledValue;
  const hsva = controlledHsva ?? internalHsva;
  const transparencyPercent = Math.round((1 - hsva.a) * 100);
  const hex = hsvaToHex(hsva).toUpperCase();

  const applyHsva = (nextHsva: PickerHsva) => {
    if (!controlledHsva) {
      setInternalHsva(nextHsva);
    }

    onChange?.({
      hsva: nextHsva,
      hex: hsvaToHex(nextHsva).toUpperCase(),
    });
  };

  const mergeHsva = (nextColor: Partial<PickerHsva>) => {
    applyHsva({ ...hsva, ...nextColor });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setColorHistory(prev =>
        [hex, ...prev.filter(color => color !== hex)].slice(
          0,
          maxHistoryCount
        )
      );
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hex, maxHistoryCount]);

  return (
    <>
      <ColorPaletteSection
        hsva={hsva}
        className={paletteClassName}
        pointerSize={pointerSize}
        onChange={nextColor => {
          mergeHsva(nextColor);
        }}
      />

      <ColorSlideSection
        hue={hsva.h}
        pointerSize={pointerSize}
        onChange={hue => {
          mergeHsva({ h: hue });
        }}
      />

      <ToneControlSection
        hsva={hsva}
        transparencyPercent={transparencyPercent}
        pointerSize={pointerSize}
        onChange={alpha => {
          mergeHsva({ a: alpha });
        }}
      />

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

      <ColorHistorySection
        colorHistory={colorHistory}
        columnCount={historyColumnCount}
        maxCount={maxHistoryCount}
        onChange={nextColor => {
          applyHsva(nextColor);
        }}
      />
    </>
  );
}

function resolveColorValue(
  value?: ColorPickerValue
): PickerHsva | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return validHex(value) ? (hexToHsva(value) as PickerHsva) : undefined;
  }

  return value;
}

export default ColorPickerBase;
