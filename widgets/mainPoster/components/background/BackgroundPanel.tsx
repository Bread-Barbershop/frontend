import { useState } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import { BackgroundColor } from './BackgroundColor';
import { BackgroundImage } from './BackgroundImage';

const ACTIVE_TAB_CLASS = 'w-13.25 p-2 border-b-[1.5px] border-b-text-primary';
const INACTIVE_TAB_CLASS =
  'w-13.25 p-2 text-text-secondary border-b-transparent';

export const BackgroundPanel = () => {
  const [type, setType] = useState<'color' | 'image'>('color');

  const handleToggleTab = (newType: 'color' | 'image') => {
    setType(newType);
  };

  return (
    <LeftEditorWrapper>
      <NavigationBar>배경</NavigationBar>
      <div className="w-full flex items-center justify-center gap-2 pb-1.5">
        <button
          onClick={() => {
            handleToggleTab('color');
          }}
          type="button"
          className={type === 'color' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}
        >
          색상
        </button>
        <button
          onClick={() => {
            handleToggleTab('image');
          }}
          type="button"
          className={type === 'image' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}
        >
          이미지
        </button>
      </div>
      {type === 'color' ? <BackgroundColor /> : <BackgroundImage />}
    </LeftEditorWrapper>
  );
};
