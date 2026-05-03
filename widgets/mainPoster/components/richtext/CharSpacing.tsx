import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { clamp } from '@/shared/utils/calculationUtils';

import { useFabricContext } from '../../context/FabricContext';

function CharSpacing() {
  const { canvas, debouncedApplyStyle } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox | null;

  const [value, setValue] = useState<number>(0);
  const [showValue, setShowValue] = useState<string>('0');

  useEffect(() => {
    if (!canvas) return;

    const sync = () => {
      const obj = canvas.getActiveObject() as Textbox | null;
      if (!obj) return;

      const cs = Number(obj.get('charSpacing') ?? 0);
      const p = clamp(cs / 10, -20, 20);

      setValue(p);
      setShowValue(String(p));
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

  const applyValue = (p: number) => {
    const next = clamp(p, -20, 20);
    setValue(next);

    const charSpacing = Math.round(next * 10); // -200~200
    debouncedApplyStyle({ charSpacing }, canvas);
  };

  return (
    <div className="bg-bg-base w-full py-2">
      <div className="mb-2 text-center text-[13px] font-semibold text-text-primary">
        자간
      </div>

      <div className="flex items-center gap-1.5 w-full">
        {/* 중앙 슬라이더 */}
        <div className="flex-1 px-1">
          <input
            type="range"
            id="charSpacing"
            min={-20}
            max={20}
            step={1}
            value={value}
            onChange={({ target: { value } }) => {
              setShowValue(value);
              applyValue(Number(value));
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6]
              [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] [&::-moz-range-thumb]:border-none"
          />
        </div>

        {/* 우측 값 표시 (입력 가능) */}
        <input
          type="text"
          value={showValue}
          onChange={({ target: { value } }) => {
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
          className="flex items-center justify-center text-center w-[47px] h-[32px] text-xs bg-bg-base border border-border-neutral focus:border-primary rounded-lg focus:outline-none"
        />
      </div>
    </div>
  );
}

export default CharSpacing;
