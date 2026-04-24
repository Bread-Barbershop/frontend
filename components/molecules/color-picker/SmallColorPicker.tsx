'use client';

import ColorPickerBase from './ColorPickerBase';
import ColorPickerNavigation from './ColorPickerNavigation';

import type { ColorPickerBaseProps } from './ColorPickerBase';

type SmallColorPickerProps = Omit<
  ColorPickerBaseProps,
  | 'paletteClassName'
  | 'pointerSize'
  | 'historyColumnCount'
  | 'maxHistoryCount'
> & {
  onClose?: () => void;
};

function SmallColorPicker({ onClose, ...pickerProps }: SmallColorPickerProps) {
  return (
    <div className="box-border flex w-70 flex-col gap-4 rounded-lg bg-white px-5 pb-5 pt-0">
      <ColorPickerNavigation onClose={onClose} />
      <ColorPickerBase
        {...pickerProps}
        pointerSize={{ outer: 26, inner: 13 }}
        historyColumnCount={6}
        maxHistoryCount={12}
      />
    </div>
  );
}

export default SmallColorPicker;
