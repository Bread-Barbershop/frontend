import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import { cn } from '@/shared/utils/cn';

import { useFabricContext } from '../../context/FabricContext';

const ALIGN_OPTIONS = [
  {
    Icon: AlignRightIcon,
    value: 'right',
    label: '오른쪽 정렬',
  },
  {
    Icon: AlignCenterIcon,
    value: 'center',
    label: '가운데 정렬',
  },

  {
    Icon: AlignLeftIcon,
    value: 'left',
    label: '왼쪽 정렬',
  },
];

function TextAlign() {
  const { getRichStyles, canvas, applyRichStyle } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;

  const [selectedAlign, setSelectedAlign] = useState(ALIGN_OPTIONS[0].value);

  useEffect(() => {
    if (!activeObject) return;

    const handleSync = () => {
      getRichStyles(activeObject, ['textAlign'], ([textAlign]) => {
        setSelectedAlign(textAlign);
      });
    };

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  if (!canvas) return null;

  return (
    <div className="w-24 h-8 flex flex-row items-center justify-center p-0.5 gap-0.5 bg-btn-inactive rounded-sm">
      {ALIGN_OPTIONS.map(option => {
        const isSelected = selectedAlign === option.value;
        const Icon = option.Icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setSelectedAlign(option.value);
              applyRichStyle(
                { textAlign: option.value as 'left' | 'right' | 'center' },
                canvas
              );
            }}
            className={cn(
              'w-7.5 h-7.5 flex p-1 justify-center items-center rounded-sm transition-colors',
              isSelected
                ? 'bg-bg-base text-text-primary'
                : 'bg-transparent text-text-tertiary hover:bg-btn-hover active:bg-btn-pressed'
            )}
          >
            <Icon fill="currentColor" aria-label={option.label} />
          </button>
        );
      })}
    </div>
  );
}

export default TextAlign;
