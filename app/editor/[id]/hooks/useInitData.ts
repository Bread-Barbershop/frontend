import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { SavedData } from '../types/savedata';

export const useInitData = ({
  savedData,
  uuid,
}: {
  savedData: SavedData | null;
  uuid: string;
}) => {
  const { blocks, bgm, imageFolderId, audioFolderId } = savedData || {};

  const { setSelectedBgmId, setIsLoop, setUserFile } = useBgmStore(
    useShallow(state => ({
      setSelectedBgmId: state.setSelectedBgmId,
      setIsLoop: state.setIsLoop,
      setUserFile: state.setUserFile,
    }))
  );

  const {
    setBlock,
    updateImage,
    selectedBlock,
    setInvitationUuid,
    setImageFolderId,
    setAudioFolderId,
  } = useEditorStore(
    useShallow(state => ({
      setBlock: state.setBlock,
      updateImage: state.updateImage,
      selectedBlock: state.selectedBlock,
      setInvitationUuid: state.setInvitationUuid,
      setImageFolderId: state.setImageFolderId,
      setAudioFolderId: state.setAudioFolderId,
    }))
  );

  const initEditStore = useCallback(() => {
    if (blocks) {
      setBlock(blocks);
      blocks.forEach(block => {
        if ('images' in block.props) {
          updateImage(block.id, block.props.images);
        }
      });
    }
    if (imageFolderId) {
      setImageFolderId(imageFolderId);
    }
    if (audioFolderId) {
      setAudioFolderId(audioFolderId);
    }
    if (uuid) {
      setInvitationUuid(uuid);
    }
    selectedBlock('mainPoster');
  }, [
    blocks,
    imageFolderId,
    audioFolderId,
    uuid,
    setBlock,
    updateImage,
    setImageFolderId,
    setAudioFolderId,
    setInvitationUuid,
    selectedBlock,
  ]);

  const initBgmStore = useCallback(() => {
    if (bgm) {
      if (bgm.bgmFile) {
        setUserFile(
          bgm.bgmFile,
          bgm.bgmInfo?.userBgmTitle || '',
          bgm.bgmInfo?.userBgmDuration || ''
        );
      }
      setIsLoop(bgm.bgmInfo?.isLoop || false);
      setSelectedBgmId(bgm.bgmInfo?.selectedBgmId || null);
    }
  }, [bgm, setUserFile, setIsLoop, setSelectedBgmId]);

  return {
    initEditStore,
    initBgmStore,
  };
};
