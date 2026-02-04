import * as fabric from 'fabric';
import { TextAlignCenter, TextAlignEnd, TextAlignStart } from 'lucide-react';
import React, { useState } from 'react';

import { Selector } from '@/components/molecules/selector';
type alignOption = {
  label: React.ReactNode;
  value: string;
  style: { textAlign: 'left' | 'center' | 'right' };
};

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}
function TextAlign({ canvas, applyRichStyle }: Props) {
  const [selectedAlign, setSelectedAlign] = useState<{
    label: React.ReactNode;
    value: string;
    style: { textAlign: 'left' | 'center' | 'right' };
  }>();
  const alignOptions: alignOption[] = [
    {
      label: <TextAlignStart className="w-3.5" />,
      value: 'left',
      style: { textAlign: 'left' },
    },
    {
      label: <TextAlignCenter className="w-3.5" />,
      value: 'center',
      style: { textAlign: 'center' },
    },
    {
      label: <TextAlignEnd className="w-3.5" />,
      value: 'right',
      style: { textAlign: 'right' },
    },
  ];

  if (!canvas) return;
  return (
    <section>
      <div className="hidden md:flex">
        <Selector
          placeholder="16px"
          options={alignOptions}
          className="bg-bg-base"
          onSelect={option => {
            const alignOption = option as alignOption;
            applyRichStyle(alignOption.style, canvas);
            setSelectedAlign(alignOption);
          }}
          selected={selectedAlign ?? alignOptions[0]}
        />
      </div>
      <div className="md:hidden">
        {alignOptions.map(align => {
          const { label, value, style } = align;
          return (
            <button
              key={value}
              type="button"
              onClick={() => applyRichStyle({ ...style }, canvas)}
              className="w-8 h-8 p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
export default TextAlign;
