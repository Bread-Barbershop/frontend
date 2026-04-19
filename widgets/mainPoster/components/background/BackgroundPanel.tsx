import { useEffect, useState } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import { BackgroundColor } from './BackgroundColor';
import { BackgroundImage } from './BackgroundImage';

const ACTIVE_TAB_CLASS = 'w-13.25 p-2 border-b-[1.5px] border-b-text-primary';
const INACTIVE_TAB_CLASS =
  'w-13.25 p-2 text-text-secondary border-b-transparent';

export const BackgroundPanel = () => {
  const [type, setType] = useState<'color' | 'image'>('color');

  // 실제 상태 변화 감시용 (비동기 로그 문제 해결)
  useEffect(() => {
    console.log('[BackgroundPanel] 현재 타입:', type);
  }, [type]);

  // 리마운트 확인용
  useEffect(() => {
    console.log('[BackgroundPanel] 컴포넌트 마운트됨');
  }, []);

  const handleToggleTab = (newType: 'color' | 'image') => {
    if (newType === 'image' && type === 'image') {
      // 이미 이미지 탭인 경우 파일 선택창 호출
      console.log('[BackgroundPanel] 이미지 탭 재클릭 - 파일 선택창 호출');
    } else {
      console.log('[BackgroundPanel] 탭 전환 요청:', newType);
      setType(newType);
    }
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
