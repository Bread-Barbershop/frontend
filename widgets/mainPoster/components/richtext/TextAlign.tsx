import { Canvas, Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { Selector } from '@/components/molecules/selector';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { selectorOptions } from '@/widgets/mainPoster/types/editor';

interface Props {
  canvas: Canvas | null;
  applyRichStyle: (styleObj: object, canvas: Canvas) => void;
}

const ALIGN_OPTIONS: selectorOptions[] = [
  {
    label: <AlignLeftIcon className="w-4.25 h-3.5" />,
    value: 'left',
  },
  {
    label: <AlignCenterIcon className="w-4.25 h-3.5" />,
    value: 'center',
  },
  {
    label: <AlignRightIcon className="w-4.25 h-3.5" />,
    value: 'right',
  },
];

function TextAlign({ canvas, applyRichStyle }: Props) {
  const { getRichStyles } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;

  const [selectedAlign, setSelectedAlign] = useState<selectorOptions>(
    ALIGN_OPTIONS[0]
  );

  useEffect(() => {
    if (!activeObject) return;

    const handleSync = () => {
      getRichStyles(activeObject, 'textAlign', textAlign => {
        const found = ALIGN_OPTIONS.find(opt => opt.value === textAlign);
        if (found) setSelectedAlign(found);
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
    <Selector
      className="w-14"
      options={ALIGN_OPTIONS}
      selected={selectedAlign}
      onSelect={option => {
        applyRichStyle({ textAlign: option.value }, canvas);
      }}
      showCheckbox={false}
    />
  );
}

export default TextAlign;
