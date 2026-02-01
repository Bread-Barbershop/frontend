import * as fabric from 'fabric';
import { ArrowRightFromLine } from 'lucide-react';
import { useState } from 'react';

import { RichStyle } from '../types/fabric';
interface Props {
  canvas: fabric.Canvas | null;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

function CharSpacing({ canvas, debouncedApplyStyle }: Props) {
  const [openCharSpacing, setOpenCharSpacing] = useState<boolean>(false);

  if (!canvas) return;
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpenCharSpacing(prev => !prev)}
        aria-label="자간 조절"
      >
        <ArrowRightFromLine className="w-3.5" />
      </button>
      {openCharSpacing && (
        <div className="absolute">
          <label htmlFor="charSpacing">자간</label>
          <input
            type="range"
            id="charSpacing"
            min="-100"
            max="1000"
            step="50"
            onChange={e => {
              debouncedApplyStyle(
                { charSpacing: Number(e.target.value) },
                canvas
              );
            }}
          />
          <input
            type="text"
            id=""
            placeholder="100"
            onChange={e => {
              debouncedApplyStyle(
                { charSpacing: Number(e.target.value) },
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
export default CharSpacing;
