import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { saveInvitationFlow } from '@/app/oauthTest/utils/saveInvitationFlow';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import SaveModal from './SaveModal';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { images, block } = useEditorStore(
    useShallow(state => ({
      images: state.images,
      block: state.block,
    }))
  );

  const {
    selectedBgmId,
    isLoop,
    volume,
    userFile,
    userFileName,
    userDuration,
    audioFileId,
  } = useBgmStore(
    useShallow(state => ({
      selectedBgmId: state.selectedBgmId,
      isLoop: state.isLoop,
      volume: state.volume,
      userFile: state.userFile,
      userFileName: state.userFileName,
      userDuration: state.userDuration,
      audioFileId: state.audioFileId,
    }))
  );

  const { canvas } = useFabricContext();

  const handleUpload = async () => {
    if (!canvas) return;

    setIsLoading(true);
    const task = images.flatMap(item =>
      item.file.map(file => ({ id: item.id, file }))
    );

    const bgmData = {
      selectedBgmId: selectedBgmId ?? null,
      isLoop,
      volume,
      userBgmTitle: userFileName ?? null,
      userBgmDuration: userDuration ?? null,
      userBgmFileId: audioFileId ?? null,
    };

    const mainPoster = canvas.toJSON();

    await saveInvitationFlow({
      images: task,
      audio: userFile,
      data: block,
      bgmData, // bgm의 data 버전.
      mainPoster,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div ref={tabRef}>
      <button
        type="button"
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold"
        onClick={() => {
          handleUpload();
          setIsModalOpen(true);
        }}
      >
        저장하기
      </button>
      {isModalOpen && <SaveModal isLoading={isLoading} />}
    </div>
  );
}

export default UploadButton;
