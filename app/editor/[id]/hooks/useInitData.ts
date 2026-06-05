import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { extractFileGroups } from '@/shared/utils/extractFileGroups';
import { getFileKey } from '@/shared/utils/fileUtils';

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
    shareUrl,
    imageFolderId,
    audioFolderId,
    invitationImage,
  } = savedData || {};

  const { resetBgm, setSelectedBgmId, setIsLoop, setUserFile } = useBgmStore(
    useShallow(state => ({
      resetBgm: state.reset,
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
    setShareUrl,
    setHashFiles,
    clearHashFiles,
    clearCleanUpFiles,
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
      setShareUrl: state.setShareUrl,
      setHashFiles: state.setHashFiles,
      clearHashFiles: state.clearHashFiles,
      clearCleanUpFiles: state.clearCleanUpFiles,
    }))
  );

  const initEditStore = useCallback(async () => {
    // 새 데이터 로딩 전 이전 해시 캐시 이력 초기화
    clearHashFiles();
    clearCleanUpFiles();

    if (blocks) {
      setBlock(blocks);

      const imageMap = extractFileGroups(blocks, invitationImage ?? []);
      if (imageMap) {
        for (const [imageId, value] of imageMap.entries()) {
          // value.file이 단일 File인 경우도 배열로 통일하여 에러 방지
          const files = Array.isArray(value.file) ? value.file : [value.file];

          for (const file of files) {
            if (file instanceof File) {
              // imageId와 파일을 함께 사용하여 같은 파일도 이미지별로 구분
              const fileKey = await getFileKey(file, imageId);
              const driveFileId = (file as any).driveFileId;
              if (driveFileId) {
                setHashFiles(`${fileKey}::${driveFileId}`);
              }
            }
          }
          updateImage(value.id, files);
        }
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
    if (shareUrl) {
      setShareUrl(shareUrl);
      const shareFiles = [
        ...(shareUrl.images ?? []),
        ...(shareUrl.urlImage ?? []),
      ].filter((f): f is File => f instanceof File);

      if (shareFiles.length > 0) {
        updateImage('shareUrl', shareFiles);
      }
    }
    selectedBlock('mainPoster');
  }, [
    blocks,
    imageFolderId,
    audioFolderId,
    uuid,
    invitationFolderId,
    shareUrl,
    setBlock,
    updateImage,
    setImageFolderId,
    setAudioFolderId,
    setInvitationUuid,
    selectedBlock,
    setInvitationFolderId,
    invitationImage,
    setShareUrl,
    setHashFiles,
    clearHashFiles,
    clearCleanUpFiles,
  ]);

  const initBgmStore = useCallback(() => {
    resetBgm();

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
  }, [bgm, resetBgm, setUserFile, setIsLoop, setSelectedBgmId]);

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
