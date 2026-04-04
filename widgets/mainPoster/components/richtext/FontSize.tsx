import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { Selector } from '@/components/molecules/selector';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { selectorOptions } from '@/widgets/mainPoster/types/editor';

function FontSize() {
  const {
    canvas,
    activeInfo,
    getRichStyles,
    applyRichStyle,
    debouncedApplyStyle,
  } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;
  const currentFontSize =
    (activeInfo?.styles?.fontSize as string | number) || '16';
  const [selectedFontSize, setSelectedFontSize] = useState<selectorOptions>({
    label: `${currentFontSize}px`,
    value: String(currentFontSize),
  });

  useEffect(() => {
    if (!activeObject) {
      return;
    }
    const handleSync = () =>
      getRichStyles(activeObject, 'fontSize', fontSize =>
        setSelectedFontSize({
          label: `${fontSize}px`,
          value: String(fontSize),
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
      className="bg-bg-base border border-border-neutral rounded-sm w-17"
      onSelect={option => {
        const safeSize = handleNumberChange(option.value);
        const isListItem = fontSize.some(f => f.value === option.value);

        if (safeSize) {
          if (isListItem) {
            applyRichStyle({ fontSize: safeSize }, canvas);
          }
        }
      }}
      onInputChange={value => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 1) {
          return;
        }
        debouncedApplyStyle({ fontSize: numValue }, canvas);
      }}
      selected={selectedFontSize}
    />
  );
}
export default FontSize;
