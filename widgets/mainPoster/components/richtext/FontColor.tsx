import { Textbox } from 'fabric';
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import SmallColorPicker from '@/components/molecules/color-picker/SmallColorPicker';
import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

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
      fill="black"
    />
    <line y1="13" x2="11" y2="13" stroke={color} strokeWidth="2" />
  </svg>
);

function FontColor() {
  const { canvas, applyRichStyle, getRichStyles } = useFabricContext();
  const [pickerColor, setPickerColor] = useState<string | null>('black');
  const [openFontColor, setOpenFontColor] = useState<boolean>(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const activeObject = canvas?.getActiveObject() as Textbox;
  const baseId = useId();
  const popoverId = `color-picker-${baseId}`;

  const updatePopoverPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
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
  }, []);

  useEffect(() => {
    if (!activeObject) {
      return;
    }
    const handleSync = () =>
      getRichStyles(activeObject, 'fill', color => setPickerColor(color));

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  const handleToggle = () => {
    if (openFontColor) {
      popoverRef.current?.hidePopover();
    } else {
      updatePopoverPosition();
      popoverRef.current?.showPopover();
    }
  };

  if (!canvas) return null;

  return (
    <section className="relative" ref={containerRef}>
      <button
        type="button"
        className="h-8 flex justify-center items-center pl-2 bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        onClick={handleToggle}
      >
        <ColorIcon color={pickerColor || 'black'} />
        <div
          className={cn(
            'flex-center size-7 transition-transform duration-200 shrink-0',
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
          top: `${popoverPos.top + 4}px`,
          left: `${popoverPos.left}px`,
          inset: 'auto',
        }}
      >
        <SmallColorPicker
          showHeader={false}
          value={pickerColor || '#000000'}
          onChange={color => {
            setPickerColor(color.hex);
            applyRichStyle({ fill: color.hex }, canvas);
            popoverRef.current?.hidePopover();
          }}
        />
      </div>
    </section>
  );
}
export default FontColor;
