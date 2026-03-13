import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { saveInvitationFlow } from '@/app/oauthTest/utils/saveInvitationFlow';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import SaveModal from './SaveModal';

function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFail, setIsFail] = useState(false);

  const {
    images,
    block,
    invitationUuid,
    imageFolderId,
    audioFolderId,
    setInvitationUuid,
    setImageFolderId,
    setAudioFolderId,
  } = useEditorStore(
    useShallow(state => ({
      images: state.images,
      block: state.block,
      invitationUuid: state.invitationUuid,
      imageFolderId: state.imageFolderId,
      audioFolderId: state.audioFolderId,
      setInvitationUuid: state.setInvitationUuid,
      setImageFolderId: state.setImageFolderId,
      setAudioFolderId: state.setAudioFolderId,
    }))
  );

  const { exportIntersectedJSON } = useFabricContext();

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

  const handleUpload = async () => {
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

    // 포스터 아예 없는 경우 여기서 처리하면 될듯
    const mainPoster = exportIntersectedJSON() ?? {
      version: '7.1.0',
      objects: [],
    };
    if (invitationUuid === '') {
      const saveResult = await saveInvitationFlow({
        images: task as { id: string; file: File }[],
        audio: userFile,
        data: block,
        bgmData, // bgm의 data 버전.
        mainPoster,
      });
      setInvitationUuid(saveResult.invitationUuid);
      setImageFolderId(saveResult.folders.imageFolderId);
      setAudioFolderId(saveResult.folders.audioFolderId);
    } else {
      const result = await trashFolder();
      //실패 토스트 알람 표시
      if (!result) {
        setIsLoading(false);
        setIsFail(true);
        return;
      }
      const saveResult = await saveInvitationFlow({
        images: task as { id: string; file: File }[],
        audio: userFile,
        data: block,
        bgmData, // bgm의 data 버전.
        mainPoster,
        invitationUuid: invitationUuid,
      });
      setInvitationUuid(saveResult.invitationUuid);
      setImageFolderId(saveResult.folders.imageFolderId);
      setAudioFolderId(saveResult.folders.audioFolderId);
    }
    setIsLoading(false);
  };

  const trashFolder = async () => {
    try {
      await Promise.all([
        fetch(`/api/drive/deleteInvitation`, {
          method: 'DELETE',
          body: JSON.stringify({ folderId: imageFolderId }),
        }),
        fetch(`/api/drive/deleteInvitation`, {
          method: 'DELETE',
          body: JSON.stringify({ folderId: audioFolderId }),
        }),
      ]);
      return true;
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      return false;
    }
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
      {isModalOpen && <SaveModal isLoading={isLoading} isFail={isFail} />}
    </div>
  );
}

export default UploadButton;
