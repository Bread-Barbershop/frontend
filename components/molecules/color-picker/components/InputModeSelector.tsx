'use client';

import { FormSelector } from '@/components/molecules/selector/FormSelector';

import { INPUT_MODE_OPTIONS } from './colorPicker.constants';

import type { InputMode } from './colorPicker.types';

export function InputModeSelector({
  value,
  onChange,
}: {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}) {
  return (
    <FormSelector
      label={<span className="sr-only">색상 입력 방식</span>}
      className="w-[72px] shrink-0"
      options={INPUT_MODE_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
