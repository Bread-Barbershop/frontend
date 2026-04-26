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
    if (!canvas) return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue < 1) {
      return null;
    }
    return numValue;
  };

  if (!canvas) return null;
  return (
    <Selector
      className="w-"
      placeholder="16px"
      options={fontSize}
      onSelect={option => {
        if (!option.value) {
          setSelectedFontSize({ label: '', value: '' });
          return;
        }

        const safeSize = handleNumberChange(option.value);
        if (safeSize) {
          setSelectedFontSize(option);
          applyRichStyle({ fontSize: safeSize }, canvas);
        }
      }}
      onInputChange={value => {
        setSelectedFontSize({ label: value ? `${value}px` : '', value: value });

        const safeSize = handleNumberChange(value);
        if (safeSize) {
          debouncedApplyStyle({ fontSize: safeSize }, canvas);
        }
      }}
      selected={selectedFontSize}
      showCheckbox={false}
    />
  );
}
export default FontSize;
