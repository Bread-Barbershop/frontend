'use client';

import ColorPickerBase from './ColorPickerBase';

import type { ColorPickerBaseProps } from './ColorPickerBase';

type SmallColorPickerProps = Omit<
  ColorPickerBaseProps,
  | 'className'
  | 'paletteClassName'
  | 'pointerSize'
  | 'historyColumnCount'
  | 'maxHistoryCount'
>;

function SmallColorPicker(props: SmallColorPickerProps) {
  return (
    <ColorPickerBase
      {...props}
      className="box-border flex w-70 flex-col gap-4 rounded-lg bg-white px-5 pb-5 pt-0"
      pointerSize={{ outer: 26, inner: 13 }}
      historyColumnCount={6}
      maxHistoryCount={12}
    />
  );
}

export default SmallColorPicker;
