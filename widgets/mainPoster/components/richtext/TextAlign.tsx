import { ReactNode } from 'react';

import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';

type alignOptionMobile = {
  child: ReactNode;
  direction: string;
  style: { textAlign: 'left' | 'center' | 'right' };
};

import { useFabricContext } from '../../context/FabricContext';

function TextAlign() {
  const { canvas, applyRichStyle } = useFabricContext();
  const alignOptionsMobile: alignOptionMobile[] = [
    {
      child: <AlignLeftIcon className="w-4.25 h-3.5" />,
      direction: 'left',
      style: { textAlign: 'left' },
    },
    {
      child: <AlignCenterIcon className="w-4.25 h-3.5" />,
      direction: 'center',
      style: { textAlign: 'center' },
    },
    {
      child: <AlignRightIcon className="w-4.25 h-3.5" />,
      direction: 'right',
      style: { textAlign: 'right' },
    },
  ];

  if (!canvas) return;
  return (
    <section>
      <div className="flex flex-row gap-2">
        {alignOptionsMobile.map(align => {
          const { child, direction, style } = align;
          return (
            <button
              key={direction}
              type="button"
              onClick={() => applyRichStyle({ ...style }, canvas)}
              className="bg-bg-secondary w-8 h-8 flex p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
            >
              {child}
            </button>
          );
        })}
      </div>
    </section>
  );
}
export default TextAlign;
