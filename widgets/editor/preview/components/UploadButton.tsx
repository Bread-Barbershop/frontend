import React from 'react';
import { useShallow } from 'zustand/shallow';

import { saveInvitationFlow } from '@/app/oauthTest/utils/saveInvitationFlow';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

function UploadButton() {
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

  const handleUpload = () => {
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

    void saveInvitationFlow({
      images: task,
      audio: userFile,
      data: block,
      bgmData, // bgm의 data 버전.
    });
  };

  return (
    <button
      type="button"
      className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold"
      onClick={handleUpload}
    >
      저장하기
    </button>
  );
}

export default UploadButton;
