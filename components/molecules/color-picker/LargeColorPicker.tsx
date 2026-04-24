'use client';

import ColorPickerBase from './ColorPickerBase';

import type { ColorPickerBaseProps } from './ColorPickerBase';

type LargeColorPickerProps = Omit<
  ColorPickerBaseProps,
  'className' | 'paletteClassName'
>;

function LargeColorPicker(props: LargeColorPickerProps) {
  return (
    <ColorPickerBase
      {...props}
      className="box-border flex w-93.75 flex-col gap-5 rounded-lg border bg-white px-5 pb-5 pt-0"
      paletteClassName="-mt-2.5 aspect-square w-full"
    />
  );
}

export default LargeColorPicker;
