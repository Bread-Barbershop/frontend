'use client';

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { cn } from '@/shared/utils/cn';

interface Props {
  children: ReactNode;
  onClose?: () => void;
  popupTitle?: string;
  variant?: 'modal' | 'floating';
  backgroundClassName?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
}

const VIEWPORT_GAP = 12;
const PANEL_GAP = 12;
const LEFT_PANEL_SELECTOR = '[data-editor-left-panel]';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export const Popup = ({
  children,
  onClose,
  popupTitle,
  variant = 'modal',
  backgroundClassName,
  wrapperClassName,
  contentClassName,
  hideCloseButton = false,
  triggerRef,
}: Props) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({
    position: 'fixed',
    left: 0,
    top: 0,
    visibility: 'hidden',
    zIndex: 1000,
  });

  const handleClosePopup = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useLayoutEffect(() => {
    if (variant !== 'floating') return;
    if (typeof window === 'undefined') return;

    const updatePosition = () => {
      const popup = popupRef.current;
      if (!popup) return;

      const trigger = triggerRef?.current;
      const triggerRect = trigger?.getBoundingClientRect();
      const panel =
        trigger?.closest(LEFT_PANEL_SELECTOR) ??
        document.querySelector(LEFT_PANEL_SELECTOR);
      const panelRect = panel?.getBoundingClientRect();
      const popupWidth = popup.offsetWidth;
      const popupHeight = popup.offsetHeight;
      const maxLeft = window.innerWidth - popupWidth - VIEWPORT_GAP;
      const maxTop = window.innerHeight - popupHeight - VIEWPORT_GAP;

      const preferredLeft = panelRect
        ? panelRect.right + PANEL_GAP
        : triggerRect
          ? triggerRect.right + PANEL_GAP
          : (window.innerWidth - popupWidth) / 2;
      const preferredTop = triggerRect
        ? triggerRect.top
        : panelRect
          ? panelRect.top
          : (window.innerHeight - popupHeight) / 2;

      setPopupStyle({
        position: 'fixed',
        left: clamp(preferredLeft, VIEWPORT_GAP, maxLeft),
        top: clamp(preferredTop, VIEWPORT_GAP, maxTop),
        visibility: 'visible',
        zIndex: 1000,
      });
    };

    updatePosition();
    const animationFrameId = window.requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const resizeObserver = new ResizeObserver(updatePosition);
    const panel = document.querySelector(LEFT_PANEL_SELECTOR);
    if (triggerRef?.current) resizeObserver.observe(triggerRef.current);
    if (popupRef.current) resizeObserver.observe(popupRef.current);
    if (panel) resizeObserver.observe(panel);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [triggerRef, variant]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (popupRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;

      handleClosePopup();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePopup();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClosePopup, triggerRef]);

  if (typeof document === 'undefined') return null;

  const popupContent = (
    <div
      className={cn(
        'w-full flex flex-col max-w-93.75 rounded-lg bg-white px-2 shadow-edit',
        wrapperClassName
      )}
      ref={popupRef}
      style={variant === 'floating' ? popupStyle : undefined}
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

      <div className={contentClassName}>{children}</div>
    </div>
  );

  if (variant === 'floating') {
    return createPortal(popupContent, document.body);
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 flex items-center justify-center',
        backgroundClassName
      )}
      role="button"
      tabIndex={0}
      onClick={event => {
        if (event.target === event.currentTarget) {
          handleClosePopup();
        }
      }}
    >
      {popupContent}
    </div>,
    document.body
  );
};
