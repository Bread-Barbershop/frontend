import { Dispatch, ReactNode, SetStateAction } from 'react';

import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import { cn } from '@/shared/utils/cn';

import { useFabricContext } from '../../context/FabricContext';
import { RichStyle } from '../../types/fabric';

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

const ItalicUnderline = ({
  activeStyles,
  setActiveStyles,
}: {
  activeStyles: activeStyle;
  setActiveStyles: Dispatch<SetStateAction<activeStyle>>;
}) => {
  const { canvas, applyRichStyle } = useFabricContext();

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
        const { id, style, component } = btn;
        const isActive = checkIsActive(id);
        return (
          <button
            key={id}
            type="button"
            aria-label={id}
            aria-pressed={isActive}
            onClick={() => {
              applyRichStyle({ ...style }, canvas);
              const s = style as activeStyle;
              setActiveStyles(prev => {
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
  );
};

export default ItalicUnderline;
