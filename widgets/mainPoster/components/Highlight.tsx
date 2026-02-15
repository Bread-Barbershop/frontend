import * as fabric from 'fabric';
import { Highlighter } from 'lucide-react';
import { useState } from 'react';

import ColorPicker from './ColorPicker';

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}
function Highlight({ canvas, applyRichStyle }: Props) {
  const [pickerColor, setPickerColor] = useState<string | null>(null);
  const [openHighlight, setOpenHighlight] = useState<boolean>(false);

  if (!canvas) return;

  return (
    <section className="relative">
      <button
        type="button"
        className="w-8 h-8 p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        onClick={() => setOpenHighlight(prev => !prev)}
      >
        <Highlighter className="w-3.5" />
      </button>
      {openHighlight && (
        <div className="absolute z-9999">
          <ColorPicker
            onColorSelect={color => {
              setPickerColor(color);
              applyRichStyle({ textBackgroundColor: color }, canvas);
            }}
            selectedColor={pickerColor}
          />
        </div>
      )}
    </section>
  );
}
export default Highlight;
