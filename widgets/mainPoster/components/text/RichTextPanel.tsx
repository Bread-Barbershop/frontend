import * as fabric from 'fabric';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import bold from '@/shared/assets/icons/bold.svg';
import charspacing from '@/shared/assets/icons/charspacing.svg';
import italic from '@/shared/assets/icons/italic.svg';
import underline from '@/shared/assets/icons/underline.svg';
import { debounce } from '@/shared/utils/debounce';
import { RichStyle, RichStyleKey } from '@/widgets/mainPoster/types/fabric';

import CharSpacing from './CharSpacing';
import FontColor from './FontColor';
import FontFamily from './FontFamily';
import FontSize from './FontSize';
import LineHeight from './LineHeight';
import TextAlign from './TextAlign';
import TextBackground from './TextBackground';
// import Shadow from './Shadow';
// import Stroke from './Stroke';
// import Highlight from './Highlight';

interface Props {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
  getRichStyles: (
    activeObject: fabric.Textbox,
    style: RichStyleKey,
    onChange: (color: string) => void
  ) => void;
}

function RichTextPanel({
  canvas,
  applyRichStyle,
  activeObject,
  getRichStyles,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const debouncedApplyStyle = useMemo(
    () =>
      debounce((style: RichStyle, canvas: fabric.Canvas) => {
        applyRichStyle(style, canvas);
      }, 300),
    [applyRichStyle]
  );

  useEffect(() => {
    // 선택 변경 시 필요한 작업을 여기에 추가할 수 있습니다.
  }, [activeObject?.id]);

  if (!canvas) return null;

  const buttons = [
    {
      id: 'bold',
      style: { fontWeight: 'bold' },
      component: <Image src={bold} alt="bold" width={11} height={14} />,
    },
    {
      id: 'italic',
      style: { fontStyle: 'italic' },
      component: <Image src={italic} alt="italic" width={11} height={14} />,
    },
    {
      id: 'underline',
      style: { underline: true },
      component: (
        <Image src={underline} alt="underline" width={10} height={14} />
      ),
    },
  ];

  return (
    <div className="flex flex-wrap flex-col items-center justify-between w-93.75 gap-2.5 px-3 py-2 bg-bg-base rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
      <div className="flex w-full justify-between">
        <FontFamily
          canvas={canvas}
          activeObject={activeObject as fabric.Textbox}
          getRichStyles={getRichStyles}
          applyRichStyle={applyRichStyle}
        />
        <FontSize
          canvas={canvas}
          activeObject={activeObject as fabric.Textbox}
          getRichStyles={getRichStyles}
          applyRichStyle={applyRichStyle}
          debouncedApplyStyle={debouncedApplyStyle}
        />
        <FontColor
          canvas={canvas}
          activeObject={activeObject as fabric.Textbox}
          getRichStyles={getRichStyles}
          applyRichStyle={applyRichStyle}
        />

        {/* <Highlight canvas={canvas} applyRichStyle={applyRichStyle} />
      <Stroke
        canvas={canvas}
        activeObject={activeObject}
        applyRichStyle={applyRichStyle}
        debouncedApplyStyle={debouncedApplyStyle}
      />
      <Shadow canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} /> */}
      </div>
      <div className="flex flex-row w-full justify-between">
        {buttons.map(btn => {
          const { id, style, component } = btn;
          return (
            <button
              key={id}
              type="button"
              onClick={() => applyRichStyle({ ...style }, canvas)}
              className="w-8 h-8 flex p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
            >
              {component}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="w-9 h-8 flex p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        >
          <Image src={charspacing} alt="charspacing" width={17} height={14} />
        </button>
        <TextAlign canvas={canvas} applyRichStyle={applyRichStyle} />
      </div>
      <TextBackground canvas={canvas} applyRichStyle={applyRichStyle} />

      <div className="flex flex-col justify-center w-full">
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
export default RichTextPanel;
