import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { clamp } from '@/shared/utils/calculationUtils';

import { useFabricContext } from '../../context/FabricContext';

const BASE_LINE_HEIGHT = 1.16;

function LineHeight() {
  const { canvas, debouncedApplyStyle } = useFabricContext();
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
    debouncedApplyStyle({ lineHeight }, canvas);
  };

  return (
    <section className="relative w-full py-2">
      <div className="bg-bg-base">
        <div className="mb-2 text-center text-[13px] font-semibold text-text-primary">
          행간
        </div>

        <div className="flex items-center gap-1.5 w-full">
          {/* 좌측 입력창 */}
          <input
            type="text"
            inputMode="decimal"
            value={showValue}
            onChange={e => {
              const data = e.target.value;
              setShowValue(data);
              const parsed = parseFloat(data);
              if (!isNaN(parsed)) applyValue(parsed);
            }}
            onBlur={() => {
              setShowValue(String(value));
            }}
            className="flex items-center justify-center text-center w-[47px] h-[32px] text-xs bg-bg-base border border-border-neutral rounded-lg focus:outline-none"
          />

          {/* 중앙 슬라이더 */}
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
            readOnly
            value={showValue}
            className="flex items-center justify-center text-center w-[47px] h-[32px] text-xs bg-bg-base border border-border-neutral rounded-lg focus:outline-none"
          />
        </div>
      </div>
    </section>
  );
}

export default LineHeight;
