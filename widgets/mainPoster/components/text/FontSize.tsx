import * as fabric from 'fabric';
import { useEffect, useState } from 'react';

import { Selector } from '@/components/molecules/selector';
import { selectorOptions } from '@/widgets/mainPoster/types/editor';
import { RichStyle, RichStyleKey } from '@/widgets/mainPoster/types/fabric';

interface Props {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Textbox | null;
  getRichStyles: (
    activeObject: fabric.Textbox,
    style: RichStyleKey,
    onChange: (value: string) => void
  ) => void;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
  debouncedApplyStyle: (style: RichStyle, canvas: fabric.Canvas) => void;
}

function FontSize({
  canvas,
  activeObject,
  getRichStyles,
  applyRichStyle,
  debouncedApplyStyle,
}: Props) {
  const [selectedFontSize, setSelectedFontSize] = useState<selectorOptions>({
    label: '16px',
    value: '16',
  });

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

  useEffect(() => {
    if (!activeObject) {
      return;
    }
    const handleSync = () =>
      getRichStyles(activeObject, 'fontSize', (value: string) =>
        setSelectedFontSize({
          label: `${value}px`,
          value: String(value),
        })
      );

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  if (!canvas) return;
  return (
    <Selector
      placeholder="16px"
      options={fontSize}
      className="bg-bg-base border border-border-neutral rounded-sm w-17"
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
