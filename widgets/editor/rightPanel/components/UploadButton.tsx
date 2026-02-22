import React from 'react';
import { useShallow } from 'zustand/shallow';

import { saveInvitationFlow } from '@/app/oauthTest/utils/saveInvitationFlow';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';

import { useEditorStore } from '../../store/useEditorStore';

function UploadButton() {
  const { images, block } = useEditorStore();

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
      className="w-full h-11 bg-white rounded-lg shadow-edit flex-center gap-2 font-semibold"
      onClick={handleUpload}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>업로드</title>
        <path
          d="M0.800781 4.7998H8.80078M4.80078 0.799805V8.7998"
          stroke="black"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      업로드
    </button>
  );
}

export default UploadButton;
