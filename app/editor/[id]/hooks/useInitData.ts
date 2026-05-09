import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { extractFileGroups } from '@/shared/utils/extractFileGroups';

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
  const {
    bulkData,
    blocks,
    bgm,
    imageFolderId,
    audioFolderId,
    invitationImage,
  } = savedData || {};

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
    setIsZoom,
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
      setIsZoom: state.setIsZoom,
    }))
  );

  const initEditStore = useCallback(() => {
    if (blocks) {
      setBlock(blocks);

      const imageMap = extractFileGroups(blocks, invitationImage ?? []);
      if (imageMap) {
        console.log('imageMap', imageMap);
        imageMap.forEach((value, key) => {
          updateImage(key, value.file);
        });
      }
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
    invitationImage,
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
      setIsZoom(bulkData.isZoom);
    }
  }, [bulkData, setBodyData, setTitleData, setBackgroundColor, setIsZoom]);
  return {
    initEditStore,
    initBgmStore,
    initBulkData,
  };
};
