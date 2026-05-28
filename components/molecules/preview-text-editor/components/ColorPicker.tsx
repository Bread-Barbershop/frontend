'use client';

import { hsvaToHex } from '@uiw/color-convert';
import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import SmallColorPicker from '@/components/molecules/color-picker/SmallColorPicker';
import {
  clampFloatingValue,
  resolveFloatingTop,
  type FloatingPlacementMode,
} from '@/shared/utils/floatingPosition';

interface Props {
  initialHex?: string;
  onClose?: () => void;
  containerRef?: RefObject<HTMLElement | null>;
  placementMode?: FloatingPlacementMode;
  onChange: (hex: string) => void;
}

const VIEWPORT_GAP = 12;
const TRIGGER_GAP = 8;
const PANEL_GAP = 12;
const LEFT_PANEL_SELECTOR = '[data-editor-left-panel]';

export default function BulkColorPicker({
  initialHex = '#FF4D6D',
  onClose,
  containerRef,
  placementMode = 'center',
  onChange,
}: Props) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({
    position: 'fixed',
    left: 0,
    top: 0,
    visibility: 'hidden',
    zIndex: 1000,
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePosition = () => {
      const trigger = containerRef?.current;
      const picker = pickerRef.current;

      if (!picker) return;

      const pickerWidth = picker.offsetWidth;
      const pickerHeight = picker.offsetHeight;
      const triggerRect = trigger?.getBoundingClientRect();
      const panel =
        trigger?.closest(LEFT_PANEL_SELECTOR) ??
        document.querySelector(LEFT_PANEL_SELECTOR);
      const panelRect = panel?.getBoundingClientRect();
      const maxLeft = window.innerWidth - pickerWidth - VIEWPORT_GAP;

      const preferredLeft = panelRect
        ? panelRect.right + PANEL_GAP
        : triggerRect
          ? triggerRect.right - pickerWidth
          : (window.innerWidth - pickerWidth) / 2;
      const left = clampFloatingValue(preferredLeft, VIEWPORT_GAP, maxLeft);
      const top = resolveFloatingTop({
        mode: placementMode,
        floatingHeight: pickerHeight,
        triggerRect,
        containerRect: panelRect,
        viewportGap: VIEWPORT_GAP,
        triggerGap: TRIGGER_GAP,
        flipSticky: true,
      });

      setPopoverStyle({
        position: 'fixed',
        left,
        top,
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
    if (containerRef?.current) resizeObserver.observe(containerRef.current);
    if (pickerRef.current) resizeObserver.observe(pickerRef.current);
    if (panel) resizeObserver.observe(panel);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [containerRef, placementMode]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div ref={pickerRef} className="shadow-xl" style={popoverStyle}>
      <SmallColorPicker
        defaultValue={initialHex}
        onClose={onClose}
        onChange={({ hsva }) => {
          const hex = hsvaToHex(hsva);

          onChange(hex);
        }}
      />
    </div>,
    document.body
  );
}
