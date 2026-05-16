'use client';

import { ReactNode, useEffect, MouseEvent, useCallback } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { cn } from '@/shared/utils/cn';

interface Props {
  children: ReactNode;
  onClose?: () => void;
  popupTitle?: string;
  backgroundClassName?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
}

export const Popup = ({
  children,
  onClose,
  popupTitle,
  backgroundClassName,
  wrapperClassName,
  contentClassName,
  hideCloseButton = false,
}: Props) => {
  const handleClosePopup = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleOutsideClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClosePopup();
    }
  };

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePopup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClosePopup]);
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 flex items-center justify-center',
        backgroundClassName
      )}
      role="button"
      tabIndex={0}
      onClick={handleOutsideClick}
    >
      <section
        className={cn(
          'w-full flex flex-col max-w-93.75 rounded-lg bg-white px-4 pt-5 pb-4 shadow-edit relative',
          wrapperClassName
        )}
      >
        <NavigationBar
          action={
            hideCloseButton ? undefined : (
              <UtilityButton
                onClick={handleClosePopup}
                variant="danger"
                size="sm"
                className="text-sm"
              >
                닫기
              </UtilityButton>
            )
          }
          className="text-sm"
        >
          {popupTitle}
        </NavigationBar>

        <div className={contentClassName} onClick={handleContentClick}>
          {children}
        </div>
      </section>
    </div>
  );
};
