import { Dispatch, ReactNode, SetStateAction } from 'react';

import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import { cn } from '@/shared/utils/cn';
import {
  hasCustomFontFace,
  loadCustomFont,
} from '@/widgets/mainPoster/utils/fontLoader';

import { useFabricContext } from '../../context/FabricContext';
import { AllStyle } from '../../types/fabric';

type ButtonsType =
  | {
      id: 'italic';
      style: Pick<AllStyle, 'fontStyle'>;
      component: ReactNode;
    }
  | {
      id: 'underline';
      style: Pick<AllStyle, 'underline'>;
      component: ReactNode;
    };

type activeStyle = {
  fontWeight: string | undefined;
  fontStyle: string | undefined;
  underline: boolean | undefined;
};

const ItalicUnderline = ({
  activeStyles,
  setActiveStyles,
}: {
  activeStyles: activeStyle;
  setActiveStyles: Dispatch<SetStateAction<activeStyle>>;
}) => {
  const { canvas, activeInfo, applyRichStyle } = useFabricContext();

  const currentFontFamily =
    (activeInfo?.styles?.fontFamily as string) || 'Pretendard';
  const currentFontWeight = (activeInfo?.styles?.fontWeight as string) || '400';

  const BUTTONS: ButtonsType[] = [
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
      case 'italic':
        return activeStyles.fontStyle === 'italic';
      case 'underline':
        return activeStyles.underline;
      default:
        return false;
    }
  };

  if (!canvas) return null;
  return (
    <div className="flex gap-1">
      {BUTTONS.map(btn => {
        const isActive = checkIsActive(btn.id);
        return (
          <button
            key={btn.id}
            type="button"
            aria-label={btn.id}
            aria-pressed={isActive}
            onClick={async () => {
              if (
                btn.id === 'italic' &&
                btn.style.fontStyle === 'italic' &&
                hasCustomFontFace(
                  currentFontFamily,
                  currentFontWeight,
                  'italic'
                )
              ) {
                await loadCustomFont(
                  currentFontFamily,
                  currentFontWeight,
                  'italic'
                );
              }

              applyRichStyle({ ...btn.style }, canvas);
              setActiveStyles(prev => {
                if (btn.id === 'italic') {
                  return { ...prev, fontStyle: btn.style.fontStyle };
                }
                if (btn.id === 'underline') {
                  return { ...prev, underline: btn.style.underline };
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
            {btn.component}
          </button>
        );
      })}
    </div>
  );
};

export default ItalicUnderline;
