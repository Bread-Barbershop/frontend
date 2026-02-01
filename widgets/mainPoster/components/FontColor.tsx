import * as fabric from 'fabric';
import { Baseline } from 'lucide-react';
import { useState } from 'react';

import ColorPicker from './ColorPicker';

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function FontColor({ canvas, applyRichStyle }: Props) {
  const [pickerColor, setPickerColor] = useState<string | null>(null);
  const [openFontColor, setOpenFontColor] = useState<boolean>(false);

  if (!canvas) return;
  return (
    <section className="relative">
      <button type="button" onClick={() => setOpenFontColor(prev => !prev)}>
        <Baseline className="w-3.5" />
      </button>
      {openFontColor && (
        <div className="absolute">
          <ColorPicker
            onColorSelect={color => {
              setPickerColor(color);
              applyRichStyle({ fill: color }, canvas);
            }}
            selectedColor={pickerColor}
          />
        </div>
      )}
    </section>
  );
}
export default FontColor;
