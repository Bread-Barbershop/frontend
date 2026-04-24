'use client';

import ColorPickerBase from './ColorPickerBase';
import ColorPickerNavigation from './ColorPickerNavigation';

import type { ColorPickerBaseProps } from './ColorPickerBase';

type LargeColorPickerProps = Omit<
  ColorPickerBaseProps,
  'paletteClassName'
> & {
  onClose?: () => void;
};

function LargeColorPicker({ onClose, ...pickerProps }: LargeColorPickerProps) {
  return (
    <div className="box-border flex w-93.75 flex-col gap-5 rounded-lg border bg-white px-5 pb-5 pt-0">
      <ColorPickerNavigation onClose={onClose} />
      <ColorPickerBase
        {...pickerProps}
        paletteClassName="-mt-2.5 aspect-square w-full"
      />
    </div>
  );
}

export default LargeColorPicker;
