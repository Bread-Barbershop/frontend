'use client';

import { notFound } from 'next/navigation';
import { useEffect } from 'react';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { usePreventBack } from '@/shared/hooks/usePreventBack';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
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
  const { initEditStore, initBgmStore, initBulkData } = useInitData({
    savedData,
    uuid,
    invitationFolderId: folderId,
  });
  const reset = useEditorStore(state => state.reset);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

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
      <div className="w-screen h-full flex justify-center items-center bg-[#E7E9EB]">
        <LoadingSpinner className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
      <div className="w-screen h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
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
