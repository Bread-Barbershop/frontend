import { Canvas } from 'fabric';

import { Selector } from '@/components/molecules/selector';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { selectorOptions } from '@/widgets/mainPoster/types/editor';
import { RichStyle } from '@/widgets/mainPoster/types/fabric';

interface Props {
  canvas: Canvas | null;
  applyRichStyle: (styleObj: object, canvas: Canvas) => void;
  debouncedApplyStyle: (style: RichStyle, canvas: Canvas) => void;
}

function FontSize({ canvas, applyRichStyle, debouncedApplyStyle }: Props) {
  const { activeInfo } = useFabricContext();
  const currentFontSize =
    (activeInfo?.styles?.fontSize as string | number) || '16';
  const selectedFontSize: selectorOptions = {
    label: `${currentFontSize}px`,
    value: String(currentFontSize),
  };

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
