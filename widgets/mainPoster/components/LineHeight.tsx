import * as fabric from 'fabric';
import { ArrowDownFromLine } from 'lucide-react';
import { useState } from 'react';

import { RichStyle } from '../types/fabric';
interface Props {
  canvas: fabric.Canvas | null;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

function LineHeight({ canvas, debouncedApplyStyle }: Props) {
  const [openLineHeight, setOpenLineHeight] = useState<boolean>(false);

  if (!canvas) return;

  return (
    <section className="relative">
      <button type="button" onClick={() => setOpenLineHeight(prev => !prev)}>
        <ArrowDownFromLine className="w-3.5" />
      </button>
      {openLineHeight && (
        <div className="absolute">
          <label htmlFor="lineHeight">행간</label>
          <input
            type="range"
            id="lineHeight"
            min="0"
            max="5"
            step="0.1"
            onChange={e => {
              debouncedApplyStyle(
                { lineHeight: Number(e.target.value) },
                canvas
              );
            }}
          />
          <input
            type="text"
            id=""
            placeholder="1.6"
            onChange={e => {
              debouncedApplyStyle(
                { lineHeight: Number(e.target.value) },
                canvas
              );
            }}
            className="flex items-center justify-between w-4 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
export default LineHeight;
