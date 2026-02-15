import * as fabric from 'fabric';
import { useEffect, useState } from 'react';

import { Selector } from '@/components/molecules/selector';

import { RichStyleKey } from '../types/fabric';

type FontOption = {
  label: string;
  value: string;
};
type CustomFontOption = {
  label: string;
  value: string;
  url: string;
};

interface Props {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Textbox | null;
  getRichStyles: (
    activeObject: fabric.Textbox,
    style: RichStyleKey,
    onChange: (value: string) => void
  ) => void;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function FontFamily({
  canvas,
  activeObject,
  getRichStyles,
  applyRichStyle,
}: Props) {
  const [selectedFont, setSelectedFont] = useState<FontOption>();

  useEffect(() => {
    if (!activeObject) {
      return;
    }
    const handleSync = () =>
      getRichStyles(activeObject, 'fontFamily', (value: string) =>
        setSelectedFont({ label: value, value })
      );

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  const defaultFontOption: FontOption[] = [
    {
      label: 'Times New Roman',
      value: 'Times New Roman',
    },
    {
      label: 'Verdana',
      value: 'Verdana',
    },
    {
      label: 'Noto Sans KR',
      value: 'Noto Sans KR',
    },
    {
      label: 'Arial',
      value: 'Arial',
    },
    {
      label: 'sans-serif',
      value: 'sans-serif',
    },
    {
      label: 'Georgia',
      value: 'Georgia',
    },
  ];

  const customFontOption: CustomFontOption[] = [
    {
      label: 'VT323',
      value: 'VT323',
      url: 'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJXUdVNF.woff2)',
    },
    {
      label: 'Pacifico',
      value: 'Pacifico',
      url: 'url(https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)',
    },
    {
      label: 'Lato100',
      value: 'Lato100',
      url: 'url(https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AXC-qNiXg7Q.woff2)',
    },
  ];

  const fontVT323 = new FontFace('VT323', customFontOption[0].url, {
    style: 'normal',
    weight: 'normal',
  });
  const fontPacifico = new FontFace('Pacifico', customFontOption[1].url, {
    style: 'normal',
    weight: 'normal',
  });

  const Lato100 = new FontFace('Lato', customFontOption[2].url, {
    style: 'normal',
    weight: '100',
  });

  const Lato900 = new FontFace('Lato', customFontOption[2].url, {
    style: 'normal',
    weight: '900',
  });

  Promise.all([
    fontVT323.load(),
    fontPacifico.load(),
    Lato100.load(),
    Lato900.load(),
  ]).then(() => {
    document.fonts.add(fontPacifico);
    document.fonts.add(fontVT323);
    document.fonts.add(Lato100);
    document.fonts.add(Lato900);
  });

  const fontOption = [...defaultFontOption, ...customFontOption];

  if (!canvas) return;
  return (
    <div>
      <Selector
        placeholder="16px"
        options={fontOption}
        className="bg-bg-base max-w-30 border border-border-neutral rounded-sm w-21.5"
        onSelect={option => {
          applyRichStyle({ fontFamily: option.value }, canvas);
          setSelectedFont(option);
        }}
        selected={selectedFont ?? fontOption[0]}
      />
    </div>
  );
}
export default FontFamily;
