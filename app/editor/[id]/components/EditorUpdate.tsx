'use client';

import { notFound } from 'next/navigation';
import { useEffect } from 'react';

import { EditorBgmPlayerProvider } from '@/components/organisms/bgm/context/EditorBgmPlayerContext';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { usePreventBack } from '@/shared/hooks/usePreventBack';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import MenuPanel from '@/widgets/editor/menuPanel/OrderPanel';
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
  const { initEditStore, initBgmStore, initBulkData } = useInitData({
    savedData,
    uuid,
    invitationFolderId: folderId,
  });
  const reset = useEditorStore(state => state.reset);
  const resetBgm = useBgmStore(state => state.reset);

  useEffect(() => {
    return () => {
      reset();
      resetBgm();
    };
  }, [reset, resetBgm]);

  useEffect(() => {
    if (savedData) {
      initBulkData();
      initEditStore();
      initBgmStore();
    }
  }, [savedData, initEditStore, initBgmStore, initBulkData]);
  usePreventBack();
  if (error) notFound();
  if (loading || !savedData) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-[#E7E9EB]">
        <LoadingSpinner className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
      <EditorBgmPlayerProvider>
        <div className="w-full h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
          <div className="min-w-[1340px] flex justify-between items-center">
            <LeftPanel />
            <div className="flex gap-[clamp(20px,calc(20px+(32-20)*((100vw-1340px)/(1920-1340))),32px)] items-center">
              <div className="pl-[clamp(0px,calc(144*((100vw-1340px)/(1920-1340))),144px)]">
                <Preview />
              </div>
              <MenuPanel />
            </div>
            <RightPanel />
          </div>
        </div>
      </EditorBgmPlayerProvider>
    </FabricProvider>
  );
}

export default EditorUpdate;
