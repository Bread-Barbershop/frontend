import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { clamp } from '@/shared/utils/calculationUtils';
import { parseValue } from '@/shared/utils/stringUtils';

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
    <div className="relative bg-bg-base px-4 py-2">
      <div className="mb-2 text-center text-sm font-semibold text-text-primary">
        자간
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          id="charSpacing"
          min={-20}
          max={20}
          step={5}
          value={value}
          onChange={e => {
            const p = Number(e.target.value);
            setShowValue(String(p));
            applyValue(p);
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
  );
}

export default CharSpacing;
