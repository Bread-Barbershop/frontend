'use client';

import { useEffect } from 'react';

import { usePreventBack } from '@/shared/hooks/usePreventBack';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
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
    <div className="min-w-[1280px] flex justify-between items-center">
      <LeftPanel />
      <Preview />
      <RightPanel />
    </div>
  );
}

export default MainContentsArea;
