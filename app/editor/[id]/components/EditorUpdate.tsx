'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

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
import { preloadPreviewFonts } from '@/widgets/mainPoster/utils/fontLoader';

import { useEditorDirtyTracker } from '../../hooks/useEditorDirtyTracker';
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

  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isFontPreviewReady, setIsFontPreviewReady] = useState(false);

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
      (async () => {
        initBulkData();
        await initEditStore();
        initBgmStore();
        setIsStoreReady(true);
      })();
    }
  }, [savedData, initEditStore, initBgmStore, initBulkData]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await preloadPreviewFonts();
      if (!cancelled) {
        setIsFontPreviewReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isEditorReady = isStoreReady && isFontPreviewReady;

  useEditorDirtyTracker(isEditorReady);
  usePreventBack();
  if (error) notFound();
  if (loading || !savedData || !isEditorReady) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-[#E7E9EB]">
        <div className="flex flex-col items-center gap-4 text-text-primary">
          <LoadingSpinner className="w-20 h-20 animate-spin" />
          <p className="text-sm">편집기를 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
      <EditorBgmPlayerProvider>
        <div className="w-full h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-x-auto overflow-y-hidden">
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
