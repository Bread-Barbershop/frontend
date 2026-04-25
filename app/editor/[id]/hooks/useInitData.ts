import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { SavedData } from '../types/savedata';

export const useInitData = ({
  savedData,
  uuid,
  invitationFolderId,
}: {
  savedData: SavedData | null;
  uuid: string;
  invitationFolderId: string;
}) => {
  const { bulkData, blocks, bgm, imageFolderId, audioFolderId } =
    savedData || {};

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
    setInvitationFolderId,
    setInvitationUuid,
    setImageFolderId,
    setAudioFolderId,
    setBodyData,
    setTitleData,
    setBackgroundColor,
  } = useEditorStore(
    useShallow(state => ({
      setBlock: state.setBlock,
      updateImage: state.updateImage,
      selectedBlock: state.selectedBlock,
      setInvitationFolderId: state.setInvitationFolderId,
      setInvitationUuid: state.setInvitationUuid,
      setImageFolderId: state.setImageFolderId,
      setAudioFolderId: state.setAudioFolderId,
      setBodyData: state.setBodyData,
      setTitleData: state.setTitleData,
      setBackgroundColor: state.setBackgroundColor,
    }))
  );

  const initEditStore = useCallback(() => {
    if (blocks) {
      setBlock(blocks);
      blocks.forEach(block => {
        if ('images' in block.props && block.props.images instanceof Array) {
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
    if (invitationFolderId) {
      setInvitationFolderId(invitationFolderId);
    }
    selectedBlock('mainPoster');
  }, [
    blocks,
    imageFolderId,
    audioFolderId,
    uuid,
    invitationFolderId,
    setBlock,
    updateImage,
    setImageFolderId,
    setAudioFolderId,
    setInvitationUuid,
    selectedBlock,
    setInvitationFolderId,
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

  const initBulkData = useCallback(() => {
    if (bulkData) {
      setBodyData(bulkData.bodyData);
      setTitleData(bulkData.titleData);
      setBackgroundColor(bulkData.backgroundColor);
    }
  }, [bulkData, setBodyData, setTitleData, setBackgroundColor]);
  return {
    initEditStore,
    initBgmStore,
    initBulkData,
  };
};
