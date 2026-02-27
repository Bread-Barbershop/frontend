import { Canvas, Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { clamp } from '@/shared/utils/calculationUtils';
import { parseValue } from '@/shared/utils/stringUtils';
import { RichStyle } from '@/widgets/mainPoster/types/fabric';

interface Props {
  canvas: Canvas | null;
  debouncedApplyStyle: (style: RichStyle, canvas: Canvas) => void;
}

const BASE_LINE_HEIGHT = 1.16;

function LineHeight({ canvas, debouncedApplyStyle }: Props) {
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
    <section className="relative">
      <div className="bg-bg-base px-4 py-2">
        <div className="mb-2 text-center text-sm font-semibold text-text-primary">
          행간
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            id="lineHeight"
            min={-20}
            max={20}
            step={5}
            value={value}
            onChange={e => {
              const d = Number(e.target.value);
              applyValue(d);
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
          />

          <input
            type="text"
            inputMode="decimal"
            value={`${showValue}%`}
            onChange={e => {
              const data = e.target.value;
              const parsed = parseValue(data, '%', '');

              setShowValue(data.replace('%', ''));
              if (parsed !== null) applyValue(parsed);
            }}
            onBlur={() => {
              setShowValue(String(value));
            }}
            className="flex items-center justify-between text-center px-2 py-2 w-16 h-8 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

export default LineHeight;
