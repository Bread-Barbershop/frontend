'use client';

import { useEffect } from 'react';

import { usePreventBack } from '@/shared/hooks/usePreventBack';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import MenuPanel from '@/widgets/editor/menuPanel/OrderPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';

function MainContentsArea() {
  usePreventBack();
  const reset = useEditorStore(state => state.reset);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);
  return (
    <div className="min-w-[1340px] h-full flex justify-between items-center">
      <LeftPanel />
      <div className="flex gap-[clamp(20px,calc(20px+(32-20)*((100vw-1340px)/(1920-1340))),32px)] items-center">
        <div className="pl-[clamp(0px,calc(144*((100vw-1340px)/(1920-1340))),144px)]">
          <Preview />
        </div>
        <MenuPanel />
      </div>

      <RightPanel />
    </div>
  );
}

export default MainContentsArea;
