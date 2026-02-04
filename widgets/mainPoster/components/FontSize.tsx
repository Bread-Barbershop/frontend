import * as fabric from 'fabric';
import { useState } from 'react';

import { Selector } from '@/components/molecules/selector';

import { selectorOptions } from '../types/editor';
import { RichStyle } from '../types/fabric';

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

function FontSize({ canvas, applyRichStyle, debouncedApplyStyle }: Props) {
  const [selectedFontSize, setSelectedFontSize] = useState<selectorOptions>();

  const fontSize: selectorOptions[] = [];
  const fontSizeList = [10, 12, 14, 16, 20, 24, 32, 40];
  fontSizeList.forEach(size => {
    const obj = {
      label: `${size}px`,
      value: String(size),
    };
    fontSize.push(obj);
  });

  const handleNumberChange = (value: string | number) => {
    if (!canvas) return;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue < 1) {
      return false;
    }
    return numValue;
  };

  if (!canvas) return;
  return (
    <Selector
      placeholder="16px"
      options={fontSize}
      className="bg-bg-base"
      onSelect={option => {
        const safeSize = handleNumberChange(option.value);
        const isListItem = fontSize.some(f => f.value === option.value);

        if (safeSize) {
          if (isListItem) {
            applyRichStyle({ fontSize: safeSize }, canvas);
          }
          setSelectedFontSize(option);
        }
      }}
      onInputChange={value => {
        setSelectedFontSize({ label: value, value: value });
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 1) {
          return;
        }
        debouncedApplyStyle({ fontSize: numValue }, canvas);
      }}
      selected={selectedFontSize ?? { label: '16px', value: '16' }}
    />
  );
}
export default FontSize;
