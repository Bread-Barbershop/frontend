import { ReactNode, useEffect } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import BoldIcon from '@/shared/assets/icons/bold.svg';
import CharspacingIcon from '@/shared/assets/icons/charspacing.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { RichStyle } from '../../types/fabric';

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

interface ButtonsType {
  id: string;
  style: RichStyle;
  component: ReactNode;
}

export const RichTextPanel = () => {
  const { activeInfo, canvas, applyRichStyle } = useFabricContext();

  useEffect(() => {
    // 선택 변경 시 필요한 작업을 여기에 추가할 수 있습니다.
  }, [activeInfo]);

  if (!canvas) return null;

  const BUTTONS: ButtonsType[] = [
    {
      id: 'bold',
      style: { fontWeight: 'bold' },
      component: <BoldIcon />,
    },
    {
      id: 'italic',
      style: { fontStyle: 'italic' },
      component: <ItalicIcon />,
    },
    {
      id: 'underline',
      style: { underline: true },
      component: <UnderlineIcon />,
    },
  ];

  return (
    <LeftEditorWrapper ariaLabel="폰트 편집">
      <NavigationBar>폰트 편집</NavigationBar>
      <div className="flex w-full justify-between">
        <FontSize />
        {BUTTONS.map(btn => {
          const { id, style, component } = btn;
          return (
            <button
              key={id}
              type="button"
              onClick={() => applyRichStyle({ ...style }, canvas)}
              className="w-8 h-8 flex p-1 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
            >
              {component}
            </button>
          );
        })}
        <button
          type="button"
          className="w-9 h-8 flex p-1 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
        >
          <CharspacingIcon />
        </button>
        <TextAlign />

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
        <FontFamily />

        <FontColor />
      </div>
      {/* <TextBackground canvas={canvas} applyRichStyle={applyRichStyle} /> */}
      <CharSpacing />
      <LineHeight />
    </LeftEditorWrapper>
  );
};
