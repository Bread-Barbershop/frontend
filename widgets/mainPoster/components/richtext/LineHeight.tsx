import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { clamp } from '@/shared/utils/calculationUtils';

import { useFabricContext } from '../../context/FabricContext';

const BASE_LINE_HEIGHT = 1.16;

function LineHeight() {
  const { canvas, applyRichStyle } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox | null;
  const [value, setValue] = useState<number>(0);
  const [showValue, setShowValue] = useState<string>('0');

  useEffect(() => {
    if (!canvas) return;

    const sync = () => {
      const obj = canvas.getActiveObject() as Textbox | null;
      if (!obj) return;

      const lineHeight = Number(obj.get('lineHeight') ?? BASE_LINE_HEIGHT);

      const clampValue = clamp(
        Math.round((lineHeight / BASE_LINE_HEIGHT - 1) * 100),
        -20,
        20
      );

      setValue(clampValue);
      setShowValue(String(clampValue));
    };

    canvas.on('selection:created', sync);
    canvas.on('selection:updated', sync);
    canvas.on('selection:cleared', sync);

    sync();

    return () => {
      canvas.off('selection:created', sync);
      canvas.off('selection:updated', sync);
      canvas.off('selection:cleared', sync);
    };
  }, [canvas]);

  if (!canvas || !activeObject) return null;

  const applyValue = (d: number) => {
    const next = clamp(d, -20, 20);
    setValue(next);
    setShowValue(String(next));

    const lineHeight = BASE_LINE_HEIGHT * (1 + next / 100); // 1.16기준
    applyRichStyle({ lineHeight }, canvas);
  };

  return (
    <div className="bg-bg-base w-full py-1 flex items-center gap-4">
      <p className="px-2 text-center text-sm font-semibold text-text-primary">
        행간
      </p>
      <div className="flex-1 px-1">
        <input
          type="range"
          id="lineHeight"
          min={-20}
          max={20}
          step={1}
          value={value}
          onChange={e => {
            const d = Number(e.target.value);
            applyValue(d);
          }}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6]
                [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] [&::-moz-range-thumb]:border-none"
        />
      </div>

      {/* 우측 값 표시 */}
      <input
        type="text"
        value={showValue}
        onChange={e => {
          const value = e.target.value;
          const numericValue = value.replace(/[^0-9.-]/g, '');
          if (numericValue !== '' && !/^-?\d*\.?\d*$/.test(numericValue))
            return;

          setShowValue(numericValue);

          const num = Number(numericValue);
          if (numericValue !== '' && !isNaN(num)) {
            applyValue(num);
          }
        }}
        onBlur={() => {
          const num = Number(showValue);
          const next = isNaN(num) ? value : clamp(num, -20, 20);
          setShowValue(String(next));
          applyValue(next);
        }}
        className="flex items-center justify-center text-center w-[47px] h-[32px] text-xs bg-bg-base border border-border-neutral rounded-lg focus:outline-none focus:border-primary"
      />
    </div>
  );
}

export default LineHeight;
