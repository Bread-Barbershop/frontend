import * as fabric from 'fabric';
import { ArrowRightToLine, Bold, Italic, Underline } from 'lucide-react';
import { useMemo, useState } from 'react';

import { debounce } from '@/shared/utils/debounce';

import { RichStyle } from '../types/fabric';

import CharSpacing from './CharSpacing';
import FontColor from './FontColor';
import FontFamily from './FontFamily';
import FontSize from './FontSize';
// import Highlight from './Highlight';
import LineHeight from './LineHeight';
import TextAlign from './TextAlign';
// import Shadow from './Shadow';
// import Stroke from './Stroke';

interface Props {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Textbox | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function Menubar({ canvas, applyRichStyle }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  ];

  return (
    <div className="flex flex-wrap flex-col items-center justify-between gap-2.5 p-3 bg-bg-base rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
      <div className="flex w-full justify-between">
        <FontSize
          canvas={canvas}
          applyRichStyle={applyRichStyle}
          debouncedApplyStyle={debouncedApplyStyle}
        />
        <FontColor canvas={canvas} applyRichStyle={applyRichStyle} />
        <FontFamily canvas={canvas} applyRichStyle={applyRichStyle} />
        {/* <Highlight canvas={canvas} applyRichStyle={applyRichStyle} />
      <Stroke
        canvas={canvas}
        activeObject={activeObject}
        applyRichStyle={applyRichStyle}
        debouncedApplyStyle={debouncedApplyStyle}
      />
      <Shadow canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} /> */}
      </div>
      <div className="flex w-full justify-between">
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
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="w-8 h-8 p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        >
          <ArrowRightToLine className="w-3.5" />
        </button>
        <TextAlign canvas={canvas} applyRichStyle={applyRichStyle} />
      </div>

      <div className="flex flex-col items-center justify-center">
        {isOpen && (
          <>
            <CharSpacing
              canvas={canvas}
              debouncedApplyStyle={debouncedApplyStyle}
            />
            <LineHeight
              canvas={canvas}
              debouncedApplyStyle={debouncedApplyStyle}
            />
          </>
        )}
      </div>
    </div>
  );
}
export default Menubar;
