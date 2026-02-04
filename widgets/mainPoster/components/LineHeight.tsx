import * as fabric from 'fabric';
import { useState } from 'react';

import { RichStyle } from '../types/fabric';
interface Props {
  canvas: fabric.Canvas | null;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

function LineHeight({ canvas, debouncedApplyStyle }: Props) {
  const [value, setValue] = useState<string>();

  if (!canvas) return;

  return (
    <section className="relative">
      <div className="bg-bg-base px-4 py-3">
        <div className="mb-2 text-center text-sm font-semibold text-text-primary">
          행간
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            id="lineHeight"
            min="0"
            max="5"
            step="0.1"
            value={value ?? '1.1'}
            onChange={e => {
              setValue(e.target.value);
              debouncedApplyStyle(
                { lineHeight: Number(e.target.value) },
                canvas
              );
            }}
            className="h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
          />
          <input
            type="text"
            id=""
            placeholder="1.6"
            value={value ?? '1.1'}
            onChange={e => {
              setValue(e.target.value);
              debouncedApplyStyle(
                { lineHeight: Number(e.target.value) },
                canvas
              );
            }}
            style={{ width: '60px' }}
            className="flex items-center justify-between px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}
export default LineHeight;
