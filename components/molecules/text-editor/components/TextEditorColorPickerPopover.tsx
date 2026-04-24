'use client';

import { hsvaToRgba } from '@uiw/color-convert';
import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import SmallColorPicker from '@/components/molecules/color-picker/SmallColorPicker';

import type { Editor } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  initialHex?: string;
  onClose?: () => void;
  containerRef?: RefObject<HTMLElement | null>;
}

const VIEWPORT_GAP = 12;
const TRIGGER_GAP = 8;
const PANEL_GAP = 12;
const LEFT_PANEL_SELECTOR = '[data-editor-left-panel]';

export default function TextEditorColorPickerPopover({
  editor,
  initialHex = '#FF4D6D',
  onClose,
  containerRef,
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

      if (!trigger || !picker) return;

      const triggerRect = trigger.getBoundingClientRect();
      const pickerWidth = picker.offsetWidth;
      const pickerHeight = picker.offsetHeight;
      const panel = trigger.closest(LEFT_PANEL_SELECTOR);
      const panelRect = panel?.getBoundingClientRect();
      const maxLeft = window.innerWidth - pickerWidth - VIEWPORT_GAP;
      const preferredLeft = panelRect
        ? panelRect.right + PANEL_GAP
        : triggerRect.right - pickerWidth;
      const left = Math.min(Math.max(preferredLeft, VIEWPORT_GAP), maxLeft);
      const preferredTop = panelRect ? triggerRect.top : triggerRect.bottom + TRIGGER_GAP;
      const top =
        preferredTop + pickerHeight <= window.innerHeight - VIEWPORT_GAP ||
        triggerRect.top - pickerHeight - TRIGGER_GAP < VIEWPORT_GAP
          ? Math.min(
              preferredTop,
              window.innerHeight - pickerHeight - VIEWPORT_GAP
            )
          : triggerRect.top - pickerHeight - TRIGGER_GAP;

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
    if (containerRef?.current) resizeObserver.observe(containerRef.current);
    if (pickerRef.current) resizeObserver.observe(pickerRef.current);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div ref={pickerRef} className="shadow-xl" style={popoverStyle}>
      <SmallColorPicker
        defaultValue={initialHex}
        onClose={onClose}
        onChange={({ hsva }) => {
          const { r, g, b, a } = hsvaToRgba(hsva);

          editor?.chain().focus().setColor(`rgba(${r}, ${g}, ${b}, ${a})`).run();
        }}
      />
    </div>,
    document.body
  );
}
