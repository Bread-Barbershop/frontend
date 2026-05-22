import { Textbox } from 'fabric';
import { ReactNode, useEffect, useState } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import BoldIcon from '@/shared/assets/icons/bold.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import { cn } from '@/shared/utils/cn';
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

type activeStyle = {
  fontWeight: string | undefined;
  fontStyle: string | undefined;
  underline: boolean | undefined;
};

export const RichTextPanel = () => {
  const { getRichStyles, canvas, applyRichStyle } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;

  const [activeStyles, setActiveStyles] = useState<activeStyle>({
    fontWeight: '400',
    fontStyle: 'normal',
    underline: false,
  });

  useEffect(() => {
    if (!activeObject) return;

    const handleSync = () => {
      getRichStyles(
        activeObject,
        ['fontWeight', 'fontStyle', 'underline'],
        ([fontWeight, fontStyle, underline]) => {
          setActiveStyles(prev => ({
            ...prev,
            fontWeight,
            fontStyle,
            underline: underline === 'true',
          }));
        }
      );
    };

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject]);

  if (!canvas) return null;

  const changeWeight = (weight: string): string => {
    const currentWeight = Number(weight) || 400;

    if (currentWeight >= 600) {
      const newWeight = Math.max(currentWeight - 200, 100);
      return String(newWeight);
    }

    const newWeight = Math.min(currentWeight + 200, 900);
    return String(newWeight);
  };

  const BUTTONS: ButtonsType[] = [
    {
      id: 'bold',
      style: {
        fontWeight: changeWeight(activeStyles.fontWeight || '400'),
      },
      component: <BoldIcon />,
    },
    {
      id: 'italic',
      style: {
        fontStyle: activeStyles.fontStyle === 'italic' ? 'normal' : 'italic',
      },
      component: <ItalicIcon />,
    },
    {
      id: 'underline',
      style: { underline: !activeStyles.underline },
      component: <UnderlineIcon />,
    },
  ];

  const checkIsActive = (id: string) => {
    switch (id) {
      case 'bold':
        return Number(activeStyles.fontWeight) >= 600;
      case 'italic':
        return activeStyles.fontStyle === 'italic';
      case 'underline':
        return activeStyles.underline;
      default:
        return false;
    }
  };

  return (
    <LeftEditorWrapper ariaLabel="폰트 편집" className="w-83.75 px-0">
      <NavigationBar>폰트 편집</NavigationBar>
      <div className="w-full">
        <FontFamily />
      </div>
      <div className="flex w-full gap-3 items-center">
        <FontSize />
        <FontColor />
        <div className="flex gap-1">
          {BUTTONS.map(btn => {
            const { id, style, component } = btn;
            const isActive = checkIsActive(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  applyRichStyle({ ...style }, canvas);
                  const s = style as activeStyle;
                  setActiveStyles(prev => {
                    if (id === 'bold' && s.fontWeight !== undefined) {
                      return { ...prev, fontWeight: String(s.fontWeight) };
                    }
                    if (id === 'italic' && s.fontStyle !== undefined) {
                      return { ...prev, fontStyle: s.fontStyle };
                    }
                    if (id === 'underline' && s.underline !== undefined) {
                      return { ...prev, underline: s.underline };
                    }
                    return prev;
                  });
                }}
                className={cn(
                  'w-8 h-8 flex p-1 justify-center items-center rounded-sm transition-colors bg-transparent',
                  isActive
                    ? ' text-primary'
                    : ' text-text-primary hover:bg-btn-hover active:bg-btn-pressed'
                )}
              >
                {component}
              </button>
            );
          })}
        </div>

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
      {/* <TextBackground canvas={canvas} applyRichStyle={applyRichStyle} /> */}
      <CharSpacing />
      <LineHeight />
    </LeftEditorWrapper>
  );
};
