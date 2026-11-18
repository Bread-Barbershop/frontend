export const olderAudio = {
  id: 'older-audio',
  name: '이전 음원.mp3',
  mimeType: 'audio/mpeg',
};

export const mappedAudio = {
  id: 'copied-selected-audio',
  name: '선택한 음원.mp3',
  mimeType: 'audio/mpeg',
};

export function savedAudioResponse(userBgmFileId?: string | null) {
  return {
    config: {
      blocks: [],
      bgm: {
        selectedBgmId: 'user-bgm',
        isLoop: false,
        volume: 0.2,
        userBgmTitle: '선택한 음원',
        userBgmDuration: null,
        ...(userBgmFileId !== undefined ? { userBgmFileId } : {}),
      },
    },
    images: { files: [] },
    audios: { files: [olderAudio, mappedAudio] },
    imageFolderId: 'image-folder',
    audioFolderId: 'audio-folder',
  };
}
