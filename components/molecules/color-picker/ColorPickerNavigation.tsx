'use client';

import { UtilityButton } from '@/components/atoms/button/UtilityButton';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';

function ColorPickerNavigation({ onClose }: { onClose?: () => void }) {
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
      색상
    </NavigationBar>
  );
}

export default ColorPickerNavigation;
