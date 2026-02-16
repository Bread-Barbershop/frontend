import * as fabric from 'fabric';
import { Eclipse } from 'lucide-react';
import { useState } from 'react';

import { RichStyle } from '@/widgets/mainPoster/types/fabric';

import ColorPicker from './ColorPicker';

interface Props {
  canvas: fabric.Canvas | null;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

function Shadow({ canvas, debouncedApplyStyle }: Props) {
  const [pickerColor, setPickerColor] = useState<string | null>(null);
  const [openShadow, setOpenShadow] = useState<boolean>(false);

  if (!canvas) return;
  return (
    <section className="relative">
      <button
        type="button"
        className="w-8 h-8 p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        onClick={() => setOpenShadow(prev => !prev)}
      >
        <Eclipse className="w-3.5" />
      </button>
      {openShadow && (
        <div className="absolute z-9999 flex">
          <ColorPicker
            onColorSelect={color => {
              setPickerColor(color);
              debouncedApplyStyle(
                {
                  shadow: {
                    color,
                    blur: 2,
                    offsetX: 2,
                    offsetY: 2,
                  },
                },
                canvas
              );
            }}
            selectedColor={pickerColor}
          />
          <div className="bg-white">
            <label htmlFor="shadowHorizon">horizontal</label>
            <input
              type="text"
              id="shadowHorizontal"
              placeholder="2"
              onChange={e => {
                debouncedApplyStyle(
                  {
                    shadow: {
                      offsetX: Number(e.target.value),
                    },
                  },
                  canvas
                );
              }}
              className="flex items-center justify-between w-15 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
            />
            <label htmlFor="shadowHorizon">vertical</label>
            <input
              type="text"
              id="shadowVertical"
              placeholder="2"
              onChange={e => {
                debouncedApplyStyle(
                  {
                    shadow: {
                      offsetY: Number(e.target.value),
                    },
                  },
                  canvas
                );
              }}
              className="flex items-center justify-between w-15 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
            />
            <label htmlFor="shadowHorizon">blur</label>
            <input
              type="text"
              id="shadowBlur"
              placeholder="2"
              onChange={e => {
                debouncedApplyStyle(
                  {
                    shadow: {
                      blur: Number(e.target.value),
                    },
                  },
                  canvas
                );
              }}
              className="flex items-center justify-between w-15 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
}
export default Shadow;
