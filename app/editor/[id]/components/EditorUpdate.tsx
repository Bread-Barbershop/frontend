'use client';

import { notFound } from 'next/navigation';
import { useEffect } from 'react';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
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

  useEffect(() => {
    if (savedData) {
      initBulkData();
      initEditStore();
      initBgmStore();
    }
  }, [savedData, initEditStore, initBgmStore, initBulkData]);

  if (error) notFound();
  if (loading || !savedData) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#E7E9EB]">
        <LoadingSpinner className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
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
