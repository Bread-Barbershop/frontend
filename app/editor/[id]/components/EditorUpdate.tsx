'use client';

import { useEffect } from 'react';

import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import { useInitData } from '../hooks/useInitData';
import { useSavedData } from '../hooks/useSavedData';

interface Props {
  folderId: string;
  uuid: string;
}

function EditorUpdate({ folderId, uuid }: Props) {
  const { savedData, loading, error } = useSavedData(folderId);
  const { initEditStore, initBgmStore } = useInitData({ savedData, uuid });

  useEffect(() => {
    if (savedData) {
      initEditStore();
      initBgmStore();
    }
  }, [savedData, initEditStore, initBgmStore]);

  if (error) return <div>에러</div>;
  if (loading) return <div>로딩중</div>;

  return (
    <FabricProvider>
      <div className="w-screen h-screen bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
        <div className="flex justify-between items-center">
          <LeftPanel />
          <Preview />
          <RightPanel />
        </div>
      </div>
    </FabricProvider>
  );
}

export default EditorUpdate;
