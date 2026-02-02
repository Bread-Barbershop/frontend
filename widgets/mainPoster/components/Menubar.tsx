import * as fabric from 'fabric';
import {
  Bold,
  Italic,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Underline,
} from 'lucide-react';
import { useMemo } from 'react';

import { debounce } from '@/shared/utils/debounce';

import { RichStyle } from '../types/fabric';

import CharSpacing from './CharSpacing';
import FontColor from './FontColor';
import FontSize from './FontSize';
import Highlight from './Highlight';
import LineHeight from './LineHeight';
import Shadow from './Shadow';
import Stroke from './Stroke';

type selectorOptions = { label: string; value: string };

interface Props {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Textbox | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function Menubar({ canvas, activeObject, applyRichStyle }: Props) {
  const strokeSize: selectorOptions[] = [];
  const strokeSizeList = [0.5, 1.0, 1.5, 2.0, 3.0];
  strokeSizeList.forEach(size => {
    const obj = {
      label: String(size),
      value: String(size),
    };
    strokeSize.push(obj);
  });

  const debouncedApplyStyle = useMemo(
    () =>
      debounce((style: RichStyle, canvas: fabric.Canvas) => {
        applyRichStyle(style, canvas);
      }, 300),
    [applyRichStyle]
  );

  if (!canvas) return null;

  const buttons = [
    {
      id: 'bold',
      style: { fontWeight: 'bold' },
      component: <Bold className="w-3.5" />,
    },
    {
      id: 'italic',
      style: { fontStyle: 'italic' },
      component: <Italic className="w-3.5" />,
    },
    {
      id: 'underline',
      style: { underline: true },
      component: <Underline className="w-3.5" />,
    },
    {
      id: 'textAlignLeft',
      style: { textAlign: 'left' },
      component: <TextAlignStart className="w-3.5" />,
    },
    {
      id: 'textAlignCenter',
      style: { textAlign: 'center' },
      component: <TextAlignCenter className="w-3.5" />,
    },
    {
      id: 'textAlignRight',
      style: { textAlign: 'right' },
      component: <TextAlignEnd className="w-3.5" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3 bg-bg-base rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
      {buttons.map(btn => {
        const { id, style, component } = btn;
        return (
          <button
            key={id}
            type="button"
            onClick={() => applyRichStyle({ ...style }, canvas)}
            className="w-8 h-8 p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
          >
            {component}
          </button>
        );
      })}

      <FontSize
        canvas={canvas}
        applyRichStyle={applyRichStyle}
        debouncedApplyStyle={debouncedApplyStyle}
      />
      <FontColor canvas={canvas} applyRichStyle={applyRichStyle} />
      <Highlight canvas={canvas} applyRichStyle={applyRichStyle} />
      <Stroke
        canvas={canvas}
        activeObject={activeObject}
        applyRichStyle={applyRichStyle}
        debouncedApplyStyle={debouncedApplyStyle}
      />
      <Shadow canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} />
      <CharSpacing canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} />
      <LineHeight canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} />
    </div>
  );
}
export default Menubar;
