'use client';

import { cn } from '@/shared/utils/cn';

import ColorPickerBase from './ColorPickerBase';
import ColorPickerNavigation from './ColorPickerNavigation';

import type { ColorPickerBaseProps } from './ColorPickerBase';
import type { ReactNode } from 'react';

type LargeColorPickerProps = Omit<
  ColorPickerBaseProps,
  'paletteClassName'
> & {
  /** 내장 헤더를 표시합니다. 부모가 제목/액션 영역을 직접 렌더링할 때는 false로 설정합니다. */
  showHeader?: boolean;
  /** 헤더 제목입니다. showHeader가 true일 때만 사용됩니다. */
  title?: ReactNode;
  /** 헤더 우측 닫기 액션입니다. showHeader가 true일 때만 표시됩니다. */
  onClose?: () => void;
};

/**
 * 기본 335px 팔레트 레이아웃을 사용하는 라지 컬러픽커입니다.
 *
 * 내부 상태로 사용할 때는 `defaultValue`를 전달하고,
 * 부모가 색상 값을 소유해야 할 때는 `value`와 `onChange`를 함께 전달합니다.
 * 이미 헤더가 있는 부모 패널 안에서 사용할 때는 `showHeader={false}`를 설정합니다.
 */
function LargeColorPicker({
  showHeader = true,
  title,
  onClose,
  ...pickerProps
}: LargeColorPickerProps) {
  return (
    <div
      className={cn(
        'box-border flex w-93.75 flex-col gap-5 rounded-lg border bg-white px-5 pb-5',
        showHeader ? 'pt-0' : 'pt-5'
      )}
    >
      {showHeader && <ColorPickerNavigation title={title} onClose={onClose} />}
      <ColorPickerBase
        {...pickerProps}
        paletteClassName={cn(
          'aspect-square w-full',
          showHeader && '-mt-2.5'
        )}
      />
    </div>
  );
}

export default LargeColorPicker;
