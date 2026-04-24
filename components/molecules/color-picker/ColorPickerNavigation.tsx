'use client';

import { UtilityButton } from '@/components/atoms/button/UtilityButton';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';

import type { ReactNode } from 'react';

function ColorPickerNavigation({
  title = '색상',
  onClose,
}: {
  title?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <NavigationBar
      action={
        onClose ? (
          <UtilityButton
            size="md"
            variant="danger"
            onClick={onClose}
            aria-label="닫기"
            className="text-sm"
          >
            닫기
          </UtilityButton>
        ) : null
      }
      direction="right"
    >
      {title}
    </NavigationBar>
  );
}

export default ColorPickerNavigation;
