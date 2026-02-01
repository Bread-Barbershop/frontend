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
      <button type="button" onClick={() => setOpenHighlight(prev => !prev)}>
        <Highlighter className="w-3.5" />
      </button>
      {openHighlight && (
        <div className="absolute">
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
