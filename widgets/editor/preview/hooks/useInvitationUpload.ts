import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { saveInvitationFlow } from '@/app/oauthTest/utils/saveInvitationFlow';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const useInvitationUpload = () => {
  const editorData = useEditorStore(useShallow(selectUploadData));

  const { exportIntersectedJSON, exportCanvasPreview } = useFabricContext();

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

  const [isLoading, setIsLoading] = useState(false);
  const [isFail, setIsFail] = useState(false);

  const applySaveResult = (
    saveResult: Awaited<ReturnType<typeof saveInvitationFlow>>
  ) => {
    if (!saveResult.success) {
      console.error('Invitation save failed:', saveResult.results);
      throw new Error('Invitation save failed.');
    }

    editorData.setInvitationUuid(saveResult.invitationUuid);
    editorData.setImageFolderId(saveResult.folders.imageFolderId);
    editorData.setAudioFolderId(saveResult.folders.audioFolderId);
    editorData.setInvitationFolderId(saveResult.folders.invitationFolderId);
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setIsFail(false);
      const task = editorData.images.flatMap(item =>
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

      const bulkData = {
        backgroundColor: editorData.backgroundColor,
        titleData: editorData.titleData,
        bodyData: editorData.bodyData,
        isZoom: editorData.isZoom,
      };

      const mainPoster = exportIntersectedJSON() ?? {
        version: '7.1.0',
        objects: [],
      };
      const invitationThumbnail = exportCanvasPreview() ?? {
        name: 'invitation-thumbnail.png',
        mimeType: 'image/png',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      };

      if (editorData.invitationUuid === '') {
        const saveResult = await saveInvitationFlow({
          bulkData,
          images: task as { id: string; file: File }[],
          audio: userFile,
          data: editorData.block,
          shareUrl: editorData.shareUrl,
          bgmData, // bgm의 data 버전.
          mainPoster,
          invitationThumbnail,
        });
        applySaveResult(saveResult);
      } else {
        const result = await trashFolder();
        //실패 토스트 알람 표시
        if (!result) {
          setIsLoading(false);
          setIsFail(true);
          return;
        }
        const saveResult = await saveInvitationFlow({
          bulkData,
          images: task as { id: string; file: File }[],
          audio: userFile,
          data: editorData.block,
          shareUrl: editorData.shareUrl,
          bgmData, // bgm의 data 버전.
          mainPoster,
          invitationThumbnail,
          invitationUuid: editorData.invitationUuid,
        });
        applySaveResult(saveResult);
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      setIsFail(true);
    } finally {
      setIsLoading(false);
    }
  };

  const trashFolder = async () => {
    try {
      const responses = await Promise.all([
        fetch(`/api/drive/deleteInvitation`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: editorData.imageFolderId }),
        }),
        fetch(`/api/drive/deleteInvitation`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: editorData.audioFolderId }),
        }),
      ]);
      return responses.every(response => response.ok);
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      return false;
    }
  };
  return {
    handleUpload,
    isLoading,
    isFail,
  };
};
