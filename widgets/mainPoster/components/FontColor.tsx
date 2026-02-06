import * as fabric from 'fabric';
import { useState } from 'react';

import ColorPicker from './ColorPicker';

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

const ColorIcon = ({ color }: { color: string }) => (
  <svg
    width="11"
    height="14"
    viewBox="0 0 11 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.46133 11H0L3.81354 0H6.74586L10.5442 11H8.09807L7.27762 8.46271H3.29696L2.46133 11ZM3.87431 6.68508H6.70028L5.31768 2.47652H5.24171L3.87431 6.68508Z"
      fill="black"
    />
    <line y1="13" x2="11" y2="13" stroke={color} strokeWidth="2" />
  </svg>
);

function FontColor({ canvas, applyRichStyle }: Props) {
  const [pickerColor, setPickerColor] = useState<string | null>(null);
  const [openFontColor, setOpenFontColor] = useState<boolean>(false);

  if (!canvas) return;
  return (
    <section className="relative">
      <button
        type="button"
        className="w-8 h-8 flex justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        onClick={() => setOpenFontColor(prev => !prev)}
      >
        <ColorIcon color={pickerColor || 'black'} />
      </button>
      {openFontColor && (
        <div className="absolute z-9999">
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
