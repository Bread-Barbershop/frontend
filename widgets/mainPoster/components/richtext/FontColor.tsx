import { Canvas } from 'fabric';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import ColorPicker from './ColorPicker';

interface Props {
  canvas: Canvas | null;
  applyRichStyle: (styleObj: object, canvas: Canvas) => void;
}

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

function FontColor({ canvas, applyRichStyle }: Props) {
  const { activeInfo } = useFabricContext();
  const currentFillColor = (activeInfo?.styles?.fill as string) || 'black';
  const [openFontColor, setOpenFontColor] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenFontColor(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!canvas) return null;
  return (
    <section className="relative" ref={containerRef}>
      <button
        type="button"
        className="h-8 flex justify-center items-center border border-border-neutral pl-2 bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        onClick={() => setOpenFontColor(prev => !prev)}
      >
        <ColorIcon color={currentFillColor} />
        <div
          className={cn(
            'flex-center size-7 transition-transform duration-200 shrink-0',
            openFontColor && 'rotate-180'
          )}
        >
          <ChevronDown size={12} />
        </div>
      </button>
      {openFontColor && (
        <div className="absolute z-9999">
          <ColorPicker
            onColorSelect={color => {
              applyRichStyle({ fill: color }, canvas);
            }}
            selectedColor={currentFillColor}
          />
        </div>
      )}
    </section>
  );
}
export default FontColor;
