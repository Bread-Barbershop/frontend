'use client';

import { hsvaToRgba } from '@uiw/color-convert';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type CSSProperties,
  type RefObject,
  useEffect,
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

import type { Editor } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  isOpen: boolean;
  initialHex?: string;
  onClose?: () => void;
  onColorChange?: (color: string) => void;
  containerRef?: RefObject<HTMLElement | null>;
  placementMode?: FloatingPlacementMode;
}

const VIEWPORT_GAP = 12;
const PANEL_GAP = 12;
const LEFT_PANEL_SELECTOR = '[data-editor-left-panel]';

export default function TextEditorColorPickerPopover({
  editor,
  isOpen,
  initialHex = '#FF4D6D',
  onClose,
  onColorChange,
  containerRef,
  placementMode = 'center',
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
    if (!isOpen) return;
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
      const left = clampFloatingValue(preferredLeft, VIEWPORT_GAP, maxLeft);
      const top = resolveFloatingTop({
        mode: placementMode,
        floatingHeight: pickerHeight,
        triggerRect,
        containerRect: panelRect,
        viewportGap: VIEWPORT_GAP,
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
    if (containerRef?.current) resizeObserver.observe(containerRef.current);
    if (pickerRef.current) resizeObserver.observe(pickerRef.current);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [containerRef, isOpen, placementMode]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof document === 'undefined') return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (pickerRef.current?.contains(target)) return;
      if (containerRef?.current?.contains(target)) return;

      onClose?.();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [containerRef, isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={pickerRef}
          className="overflow-hidden rounded-lg bg-white shadow-xl"
          style={popoverStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        >
          <SmallColorPicker
            defaultValue={initialHex}
            onChange={({ hsva }) => {
              const { r, g, b, a } = hsvaToRgba(hsva);
              const nextColor = `rgba(${r}, ${g}, ${b}, ${a})`;

              onColorChange?.(nextColor);
              editor?.chain().focus().setColor(nextColor).run();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
