'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/utils/cn';

export type EditorCalloutArrowSide = 'top' | 'right' | 'bottom' | 'left';
export type EditorCalloutAlign = 'start' | 'center' | 'end';
export type EditorCalloutAnchor = {
  x?: number;
  y?: number;
};
export type EditorCalloutArrowOffset = EditorCalloutAlign | number;

type EditorCalloutOffset = {
  mainAxis?: number;
  crossAxis?: number;
};

type EditorCalloutProps = {
  targetRef: RefObject<HTMLElement | null>;
  children?: ReactNode;
  text?: string;
  open?: boolean;
  arrowSide?: EditorCalloutArrowSide;
  arrowOffset?: EditorCalloutArrowOffset;
  targetAnchor?: EditorCalloutAnchor;
  offset?: number | EditorCalloutOffset;
  className?: string;
  zIndex?: number;
};

const VIEWPORT_GAP = 12;
const DEFAULT_MAIN_AXIS_OFFSET = 10;
const ARROW_LENGTH = 10;
const ARROW_BASE = 10;
const ARROW_OVERLAP = 1;

const getOffset = (offset: EditorCalloutProps['offset']) => {
  if (typeof offset === 'number') {
    return { mainAxis: offset, crossAxis: 0 };
  }

  return {
    mainAxis: offset?.mainAxis ?? DEFAULT_MAIN_AXIS_OFFSET,
    crossAxis: offset?.crossAxis ?? 0,
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const resolveArrowOffset = (
  bubbleSize: number,
  arrowOffset: EditorCalloutArrowOffset = 0
) => {
  if (typeof arrowOffset === 'number') {
    return clamp(arrowOffset, ARROW_BASE, bubbleSize - ARROW_BASE);
  }

  if (arrowOffset === 'start') return 12;
  if (arrowOffset === 'end') return bubbleSize - 12;

  return bubbleSize / 2;
};

const defaultAnchorBySide: Record<
  EditorCalloutArrowSide,
  Required<EditorCalloutAnchor>
> = {
  top: { x: 0.5, y: 1 },
  right: { x: 0, y: 0.5 },
  bottom: { x: 0.5, y: 0 },
  left: { x: 1, y: 0.5 },
};

function EditorCallout({
  targetRef,
  children,
  text,
  open = true,
  arrowSide = 'top',
  arrowOffset = 0,
  targetAnchor,
  offset,
  className,
  zIndex = 20000,
}: EditorCalloutProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [arrowStyle, setArrowStyle] = useState<CSSProperties>({});
  const [style, setStyle] = useState<CSSProperties>({
    position: 'fixed',
    left: 0,
    top: 0,
    visibility: 'hidden',
    zIndex,
  });

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const target = targetRef.current;
      const bubble = bubbleRef.current;
      if (!target || !bubble) return;

      const targetRect = target.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const { mainAxis, crossAxis } = getOffset(offset);
      const defaultAnchor = defaultAnchorBySide[arrowSide];
      const anchorX = targetAnchor?.x ?? defaultAnchor.x;
      const anchorY = targetAnchor?.y ?? defaultAnchor.y;
      const targetX = targetRect.left + targetRect.width * anchorX;
      const targetY = targetRect.top + targetRect.height * anchorY;
      const gap = mainAxis + ARROW_LENGTH - ARROW_OVERLAP;

      let nextLeft = 0;
      let nextTop = 0;
      let nextArrowStyle: CSSProperties = {};

      if (arrowSide === 'top' || arrowSide === 'bottom') {
        const arrowX = resolveArrowOffset(bubbleRect.width, arrowOffset);
        nextLeft = targetX - arrowX + crossAxis;
        nextTop =
          arrowSide === 'top'
            ? targetY + gap
            : targetY - bubbleRect.height - gap;
        nextArrowStyle = {
          width: ARROW_BASE,
          height: ARROW_LENGTH,
          border: 'none',
          outline: 'none',
          backgroundColor: '#1F2937',
          clipPath:
            arrowSide === 'top'
              ? 'polygon(0 0, 0 100%, 100% 100%)'
              : 'polygon(0 0, 100% 0, 0 100%)',
          left: arrowX,
          [arrowSide]: 0,
          transform:
            arrowSide === 'top'
              ? `translateY(calc(-100% + ${ARROW_OVERLAP}px))`
              : `translateY(calc(100% - ${ARROW_OVERLAP}px))`,
        };
      } else {
        const arrowY = resolveArrowOffset(bubbleRect.height, arrowOffset);
        nextLeft =
          arrowSide === 'left'
            ? targetX + gap
            : targetX - bubbleRect.width - gap;
        nextTop = targetY - arrowY + crossAxis;
        nextArrowStyle = {
          width: ARROW_LENGTH,
          height: ARROW_BASE,
          border: 'none',
          outline: 'none',
          backgroundColor: '#1F2937',
          clipPath:
            arrowSide === 'left'
              ? 'polygon(0 0, 100% 0, 100% 100%)'
              : 'polygon(0 0, 100% 0, 0 100%)',
          top: arrowY,
          [arrowSide]: 0,
          transform:
            arrowSide === 'left'
              ? `translateX(calc(-100% + ${ARROW_OVERLAP}px))`
              : `translateX(calc(100% - ${ARROW_OVERLAP}px))`,
        };
      }

      setArrowStyle(nextArrowStyle);
      setStyle({
        position: 'fixed',
        left: clamp(
          nextLeft,
          VIEWPORT_GAP,
          window.innerWidth - bubbleRect.width - VIEWPORT_GAP
        ),
        top: clamp(
          nextTop,
          VIEWPORT_GAP,
          window.innerHeight - bubbleRect.height - VIEWPORT_GAP
        ),
        visibility: 'visible',
        zIndex,
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const resizeObserver = new ResizeObserver(updatePosition);
    if (targetRef.current) resizeObserver.observe(targetRef.current);
    if (bubbleRef.current) resizeObserver.observe(bubbleRef.current);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [arrowOffset, arrowSide, offset, open, targetAnchor, targetRef, zIndex]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={bubbleRef}
          role="status"
          className={cn(
            'pointer-events-none rounded-[4px] bg-[#1F2937] px-3 py-2 text-[16px] font-medium leading-6 text-white shadow-[0_12px_24px_-12px_rgb(0_0_0_/_45%)]',
            className,
            'border-0 outline-none ring-0'
          )}
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <span aria-hidden="true" className="absolute" style={arrowStyle} />
          {children ?? text}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default EditorCallout;
