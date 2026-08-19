'use client';

import { hexToHsva, hsvaToHex, validHex } from '@uiw/color-convert';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ColorConverterSection } from './components/ColorConverterSection';
import { ColorHistorySection } from './components/ColorHistorySection';
import { ColorPaletteSection } from './components/ColorPaletteSection';
import {
  COLOR_HISTORY_COLUMN_COUNT,
  MAX_COLOR_HISTORY_COUNT,
} from './components/colorPicker.constants';
import { ColorSlideSection } from './components/ColorSlideSection';
import { ToneControlSection } from './components/ToneControlSection';
import { useColorHistoryStore } from './store/useColorHistoryStore';

import type {
  ColorPickerChange,
  ColorPickerValue,
  InputMode,
  PickerHsva,
} from './components/colorPicker.types';
import type { GlassPointerSize } from './components/GlassPointer';
import type { PointerEvent as ReactPointerEvent } from 'react';

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
  const initialHsva = resolvedControlledValue ??
    resolvedDefaultValue ?? { h: 0, s: 0, v: 68, a: 1 };
  const [internalHsva, setInternalHsva] = useState<PickerHsva>(initialHsva);
  const [inputMode, setInputMode] = useState<InputMode>('hex');
  const hsvaRef = useRef<PickerHsva>(initialHsva);
  const removePointerEndListenersRef = useRef<(() => void) | null>(null);
  const colorHistory = useColorHistoryStore(state => state.colorHistory);
  const addColorHistory = useColorHistoryStore(state => state.addColorHistory);
  const controlledHsva = resolvedControlledValue;
  const hsva = controlledHsva ?? internalHsva;
  const transparencyPercent = Math.round((1 - hsva.a) * 100);
  const hex = hsvaToHex(hsva).toUpperCase();

  const applyHsva = (nextHsva: PickerHsva) => {
    hsvaRef.current = nextHsva;

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
    hsvaRef.current = hsva;
  }, [hsva]);

  const commitColorHistory = useCallback(() => {
    addColorHistory(hsvaToHex(hsvaRef.current).toUpperCase(), maxHistoryCount);
  }, [addColorHistory, maxHistoryCount]);

  const clearPointerEndListeners = useCallback(() => {
    removePointerEndListenersRef.current?.();
    removePointerEndListenersRef.current = null;
  }, []);

  const handleColorControlPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (typeof window === 'undefined') return;

      clearPointerEndListeners();

      const handlePointerEnd = () => {
        commitColorHistory();
        clearPointerEndListeners();
      };

      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
      removePointerEndListenersRef.current = () => {
        window.removeEventListener('pointerup', handlePointerEnd);
        window.removeEventListener('pointercancel', handlePointerEnd);
      };
    },
    [clearPointerEndListeners, commitColorHistory]
  );

  useEffect(() => clearPointerEndListeners, [clearPointerEndListeners]);

  return (
    <>
      <ColorPaletteSection
        hsva={hsva}
        className={paletteClassName}
        pointerSize={pointerSize}
        onPointerDown={handleColorControlPointerDown}
        onChange={nextColor => {
          mergeHsva(nextColor);
        }}
      />

      <ColorSlideSection
        hue={hsva.h}
        pointerSize={pointerSize}
        onPointerDown={handleColorControlPointerDown}
        onChange={hue => {
          mergeHsva({ h: hue });
        }}
      />

      <ToneControlSection
        hsva={hsva}
        transparencyPercent={transparencyPercent}
        pointerSize={pointerSize}
        onPointerDown={handleColorControlPointerDown}
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

function resolveColorValue(value?: ColorPickerValue): PickerHsva | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return validHex(value) ? (hexToHsva(value) as PickerHsva) : undefined;
  }

  return value;
}

export default ColorPickerBase;
