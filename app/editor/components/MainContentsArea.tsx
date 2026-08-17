'use client';

import { useEffect, useState } from 'react';

import { EditorBgmPlayerProvider } from '@/components/organisms/bgm/context/EditorBgmPlayerContext';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { usePreventBack } from '@/shared/hooks/usePreventBack';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import MenuPanel from '@/widgets/editor/menuPanel/OrderPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';

import { useInitData } from '../[id]/hooks/useInitData';
import { useEditorDirtyTracker } from '../hooks/useEditorDirtyTracker';

import type { SavedData } from '../[id]/types/savedata';

function MainContentsArea({ savedData }: { savedData?: SavedData | null }) {
  usePreventBack();
  const [isDirtyTrackerEnabled, setIsDirtyTrackerEnabled] = useState(
    !savedData
  );
  const reset = useEditorStore(state => state.reset);
  const resetBgm = useBgmStore(state => state.reset);
  const showAllCalloutsFor = useEditorCalloutStore(
    state => state.showAllCalloutsFor
  );
  const hideAllCallouts = useEditorCalloutStore(state => state.hideAllCallouts);
  const { initEditStore, initBgmStore, initBulkData } = useInitData({
    savedData: savedData ?? null,
    uuid: '',
    invitationFolderId: '',
  });

  useEditorDirtyTracker(isDirtyTrackerEnabled);

  useEffect(() => {
    resetBgm();
    showAllCalloutsFor(6000);

    return () => {
      reset();
      resetBgm();
      hideAllCallouts();
    };
  }, [hideAllCallouts, reset, resetBgm, showAllCalloutsFor]);

  useEffect(() => {
    if (!savedData) {
      return;
    }

    let cancelled = false;

    (async () => {
      initBulkData();
      await initEditStore();
      initBgmStore();
      if (!cancelled) {
        setIsDirtyTrackerEnabled(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [savedData, initEditStore, initBgmStore, initBulkData]);

  return (
    <EditorBgmPlayerProvider>
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
    </EditorBgmPlayerProvider>
  );
}

export default MainContentsArea;
