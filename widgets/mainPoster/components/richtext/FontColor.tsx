import { hsvaToHex } from '@uiw/color-convert';
import { Textbox } from 'fabric';
import { ChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import {
  ColorPickerValue,
  PickerHsva,
} from '@/components/molecules/color-picker/components/colorPicker.types';
import SmallColorPicker from '@/components/molecules/color-picker/SmallColorPicker';
import { cn } from '@/shared/utils/cn';
import {
  clampFloatingValue,
  resolveFloatingTop,
} from '@/shared/utils/floatingPosition';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { convertFabricColor } from '../../utils/fabricUtils';

const VIEWPORT_GAP = 12;
const PANEL_GAP = 12;
const LEFT_PANEL_SELECTOR = '[data-editor-left-panel]';

const ColorIcon = ({ color }: { color: string }) => (
  <svg
    width="11"
    height="14"
    viewBox="0 0 11 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.46133 11H0L3.81354 0H6.74586L10.5442 11H8.09807L7.27762 8.46271H3.29696L2.46133 11ZM3.87431 6.68508H6.70028L5.31768 2.47652H5.24171L3.87431 6.68508Z"
      fill="currentColor"
    />
    <line y1="13" x2="11" y2="13" stroke={color} strokeWidth="2" />
  </svg>
);

function FontColor() {
  const { canvas, applyRichStyle, getRichStyles } = useFabricContext();
  const [pickerColor, setPickerColor] = useState<ColorPickerValue>({
    h: 0,
    s: 0,
    v: 0,
    a: 1,
  });
  const [openFontColor, setOpenFontColor] = useState<boolean>(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isPickingColorRef = useRef(false);
  const activeObject = canvas?.getActiveObject() as Textbox;
  const baseId = useId();
  const popoverId = `color-picker-${baseId}`;

  const updatePopoverPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const triggerRect = container.getBoundingClientRect();
    const panel = container.closest(LEFT_PANEL_SELECTOR);
    const panelRect = panel?.getBoundingClientRect();
    const popoverWidth = popoverRef.current?.offsetWidth ?? 0;
    const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
    const maxLeft = window.innerWidth - popoverWidth - VIEWPORT_GAP;
    const preferredLeft = panelRect
      ? panelRect.right + PANEL_GAP
      : triggerRect.right - popoverWidth;

    setPopoverPos({
      top: resolveFloatingTop({
        mode: 'center',
        floatingHeight: popoverHeight,
        triggerRect,
        containerRect: panelRect,
        viewportGap: VIEWPORT_GAP,
      }),
      left: clampFloatingValue(preferredLeft, VIEWPORT_GAP, maxLeft),
    });
  }, []);

  const handleColorPickerToggle = () => {
    if (openFontColor) {
      popoverRef.current?.hidePopover();
    } else {
      updatePopoverPosition();
      popoverRef.current?.showPopover();
      window.requestAnimationFrame(updatePopoverPosition);
    }
  };

  const getIconColor = (color: ColorPickerValue) => {
    if (typeof color === 'string') return color;
    return hsvaToHex(color as PickerHsva);
  };

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const handleToggleEvent = (e: Event) => {
      const toggleEvent = e as ToggleEvent;
      setOpenFontColor(toggleEvent.newState === 'open');
      if (toggleEvent.newState === 'open') updatePopoverPosition();
    };

    el.addEventListener('toggle', handleToggleEvent);
    return () => el.removeEventListener('toggle', handleToggleEvent);
  }, [updatePopoverPosition]);

  useEffect(() => {
    if (!openFontColor) return;
    if (typeof window === 'undefined') return;

    updatePopoverPosition();
    const animationFrameId = window.requestAnimationFrame(
      updatePopoverPosition
    );

    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    const resizeObserver = new ResizeObserver(updatePopoverPosition);
    const panel = document.querySelector(LEFT_PANEL_SELECTOR);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (popoverRef.current) resizeObserver.observe(popoverRef.current);
    if (panel) resizeObserver.observe(panel);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
      resizeObserver.disconnect();
    };
  }, [openFontColor, updatePopoverPosition]);

  useEffect(() => {
    if (!activeObject) {
      return;
    }
    const handleSync = () => {
      if (isPickingColorRef.current) return;

      getRichStyles(activeObject, ['fill'], ([color]) => setPickerColor(color));
    };

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  useEffect(() => {
    const handlePointerUp = () => {
      requestAnimationFrame(() => {
        isPickingColorRef.current = false;
      });
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  if (!canvas) return null;

  return (
    <section className="relative" ref={containerRef}>
      <button
        type="button"
        className="px-1 flex h-8 w-[50px] items-center justify-between overflow-hidden rounded-sm bg-white py-1 pl-3 text-text-primary shadow-[inset_0_0_0_1px_#eaeaea] transition-colors hover:bg-[#FAFAFB] active:bg-[#F5F8FF]"
        onClick={handleColorPickerToggle}
      >
        <ColorIcon color={getIconColor(pickerColor) || 'black'} />
        <div
          className={cn(
            'flex-center size-6 transition-transform duration-200 shrink-0',
            openFontColor && 'rotate-180'
          )}
        >
          <ChevronDown size={12} />
        </div>
      </button>

      <div
        id={popoverId}
        ref={popoverRef}
        popover="auto"
        className="z-9999 border-none p-0 m-0 fixed bg-transparent overflow-visible"
        style={{
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          inset: 'auto',
          touchAction: 'none',
        }}
        onPointerDown={() => {
          isPickingColorRef.current = true;
        }}
      >
        <SmallColorPicker
          showHeader={true}
          value={pickerColor || '#000000'}
          onChange={color => {
            setPickerColor(color.hsva);
            applyRichStyle({ fill: convertFabricColor(color) }, canvas);
          }}
        />
      </div>
    </section>
  );
}
export default FontColor;
