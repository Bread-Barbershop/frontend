'use client';

import { cn } from '@/shared/utils/cn';

import ColorPickerBase from './ColorPickerBase';
import ColorPickerNavigation from './ColorPickerNavigation';

import type { ColorPickerBaseProps } from './ColorPickerBase';
import type { ReactNode } from 'react';

type SmallColorPickerProps = Omit<
  ColorPickerBaseProps,
  | 'paletteClassName'
  | 'pointerSize'
  | 'historyColumnCount'
  | 'maxHistoryCount'
> & {
  showHeader?: boolean;
  title?: ReactNode;
  onClose?: () => void;
};

function SmallColorPicker({
  showHeader = true,
  title,
  onClose,
  ...pickerProps
}: SmallColorPickerProps) {
  return (
    <div
      className={cn(
        'box-border flex w-70 flex-col gap-4 rounded-lg bg-white px-5 pb-5',
        showHeader ? 'pt-0' : 'pt-5'
      )}
    >
      {showHeader && <ColorPickerNavigation title={title} onClose={onClose} />}
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
