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
      <button
        type="button"
        className="w-8 h-8 p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        onClick={() => setOpenLineHeight(prev => !prev)}
      >
        <ArrowDownFromLine className="w-3.5" />
      </button>
      {openLineHeight && (
        <div className="absolute z-9999 left-0 top-10 w-[320px] rounded-xl bg-white px-4 py-3 shadow-lg">
          <div className="mb-2 text-center text-sm font-semibold text-gray-900">
            행간
          </div>
          <div className="flex items-center gap-3">
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
              className="h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
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
              style={{ width: '60px' }}
              className="flex items-center justify-between px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
}
export default LineHeight;
