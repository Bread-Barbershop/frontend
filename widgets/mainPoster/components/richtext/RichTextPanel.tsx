import { Canvas } from 'fabric';
import { useEffect, useMemo } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import BoldIcon from '@/shared/assets/icons/bold.svg';
import CharspacingIcon from '@/shared/assets/icons/charspacing.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import { debounce } from '@/shared/utils/debounce';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { RichStyle } from '@/widgets/mainPoster/types/fabric';

import CharSpacing from './CharSpacing';
import FontColor from './FontColor';
import FontFamily from './FontFamily';
import FontSize from './FontSize';
import LineHeight from './LineHeight';
import TextAlign from './TextAlign';
// import TextBackground from './TextBackground';
// import Shadow from './Shadow';
// import Stroke from './Stroke';
// import Highlight from './Highlight';

interface Props {
  canvas: Canvas | null;
  applyRichStyle: (styleObj: object, canvas: Canvas) => void;
}

function RichTextPanel({ canvas, applyRichStyle }: Props) {
  const { activeInfo } = useFabricContext();
  const debouncedApplyStyle = useMemo(
    () =>
      debounce((style: RichStyle, canvas: Canvas) => {
        applyRichStyle(style, canvas);
      }, 300),
    [applyRichStyle]
  );

  useEffect(() => {
    // 선택 변경 시 필요한 작업을 여기에 추가할 수 있습니다.
  }, [activeInfo]);

  if (!canvas) return null;

  const BUTTONS = [
    {
      id: 'bold',
      style: { fontWeight: 'bold' },
      component: <BoldIcon className="w-2.75 h-3.5" />,
    },
    {
      id: 'italic',
      style: { fontStyle: 'italic' },
      component: <ItalicIcon className="w-2.75 h-3.5" />,
    },
    {
      id: 'underline',
      style: { underline: true },
      component: <UnderlineIcon className="w-2.5 h-3.5" />,
    },
  ];

  return (
    <LeftEditorWrapper ariaLabel="폰트 편집">
      <NavigationBar>폰트 편집</NavigationBar>
      <div className="flex w-full justify-between">
        <FontSize
          canvas={canvas}
          applyRichStyle={applyRichStyle}
          debouncedApplyStyle={debouncedApplyStyle}
        />
        {BUTTONS.map(btn => {
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
          className="w-9 h-8 flex p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        >
          <CharspacingIcon className="w-4.25 h-3.5" />
        </button>
        <TextAlign canvas={canvas} applyRichStyle={applyRichStyle} />

        {/* <Highlight canvas={canvas} applyRichStyle={applyRichStyle} />
      <Stroke
        canvas={canvas}
        activeObject={activeObject}
        applyRichStyle={applyRichStyle}
        debouncedApplyStyle={debouncedApplyStyle}
      />
      <Shadow canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} /> */}
      </div>
      <div className="flex flex-row w-full justify-evenly">
        <FontFamily canvas={canvas} applyRichStyle={applyRichStyle} />

        <FontColor canvas={canvas} applyRichStyle={applyRichStyle} />
      </div>
      {/* <TextBackground canvas={canvas} applyRichStyle={applyRichStyle} /> */}
      <CharSpacing canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} />
      <LineHeight canvas={canvas} debouncedApplyStyle={debouncedApplyStyle} />
    </LeftEditorWrapper>
  );
}
export default RichTextPanel;
