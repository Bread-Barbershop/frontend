import * as fabric from 'fabric';
import { TypeOutline } from 'lucide-react';
import { useState } from 'react';

import { Selector } from '@/components/molecules/selector';

import { selectorOptions } from '../types/editor';
import { RichStyle } from '../types/fabric';

import ColorPicker from './ColorPicker';

interface Props {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Textbox | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

// 스트로크 색상 변경시 두께 초기화되는거 수정
// 스트로크 굵기 먼저 설정한 경우는 기본 스트로크 색 설정

function Stroke({
  canvas,
  activeObject,
  applyRichStyle,
  debouncedApplyStyle,
}: Props) {
  const [openStrokeColor, setOpenStrokeColor] = useState<boolean>(false);
  const [pickerColor, setPickerColor] = useState<string | null>(null);
  const [selectedStrokeSize, setSelectedStrokeSize] = useState<selectorOptions>(
    {
      label: '0.5',
      value: '0.5',
    }
  );

  const strokeSize: selectorOptions[] = [];
  const strokeSizeList = [0.5, 1.0, 1.5, 2.0, 3.0];
  strokeSizeList.forEach(size => {
    const obj = {
      label: String(size),
      value: String(size),
    };
    strokeSize.push(obj);
  });

  if (!canvas) return;
  return (
    <section className="relative">
      <button type="button" onClick={() => setOpenStrokeColor(prev => !prev)}>
        <TypeOutline className="w-3.5" />
      </button>
      {openStrokeColor && (
        <div className="absolute flex gap-5">
          <ColorPicker
            onColorSelect={color => {
              if (!activeObject) return null;
              setPickerColor(color);

              const selectionStyles = activeObject.getSelectionStyles();
              const currentWidth =
                selectionStyles.length > 0 && selectionStyles[0].strokeWidth
                  ? selectionStyles[0].strokeWidth
                  : activeObject.get('strokeWidth');

              applyRichStyle(
                {
                  stroke: color,
                  strokeWidth: currentWidth,
                },
                canvas
              );
            }}
            selectedColor={pickerColor}
          />
          <Selector
            placeholder="0.5"
            options={strokeSize}
            onSelect={option => {
              applyRichStyle({ strokeWidth: Number(option.value) }, canvas);
              setSelectedStrokeSize(option);
            }}
            onInputChange={value => {
              debouncedApplyStyle({ strokeWidth: Number(value) }, canvas);
            }}
            selected={selectedStrokeSize ?? null}
          />
        </div>
      )}
    </section>
  );
}
export default Stroke;
