import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { hasPreparedInvitation } from '@/features/invitation/save/prepareCache';
import { saveInvitationFlow } from '@/features/invitation/save/saveInvitationFlow';
import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import { getFileKey } from '@/shared/utils/fileUtils';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const useInvitationUpload = () => {
  const editorData = useEditorStore(useShallow(selectUploadData));
  const { hashFiles, setHashFiles, setCleanUpFiles, clearHashFiles, clearCleanUpFiles } =
    useEditorStore(
      useShallow(state => ({
        hashFiles: state.hashFiles,
        setHashFiles: state.setHashFiles,
        setCleanUpFiles: state.setCleanUpFiles,
        clearHashFiles: state.clearHashFiles,
        clearCleanUpFiles: state.clearCleanUpFiles,
      }))
    );

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

  const applySaveResult = async (
    saveResult: Awaited<ReturnType<typeof saveInvitationFlow>>,
    allTasks: { id: string; file: File | string }[]
  ) => {
    if (!saveResult.success) {
      console.error('Invitation save failed:', saveResult.results);
      throw new Error('Invitation save failed.');
    }

    editorData.setInvitationUuid(saveResult.invitationUuid);
    editorData.setImageFolderId(saveResult.folders.imageFolderId);
    editorData.setAudioFolderId(saveResult.folders.audioFolderId);
    editorData.setInvitationFolderId(saveResult.folders.invitationFolderId);

    // 성공한 File 객체들에 driveFileId 속성 심기 (다음 저장 시 참조용)
    saveResult.results.images.ok.forEach(ok => {
      Object.defineProperty(ok.file, 'driveFileId', {
        value: ok.fileId,
        writable: false,
        configurable: true,
        enumerable: false,
      });
    });

    // 성공한 파일들의 fileKey -> fileId 매핑 (비동기 처리)
    // newTasks의 파일들만 업로드되었으므로, allTasks에서 찾아야 함
    const successfulFilesMap = new Map(
      saveResult.results.images.ok.map(ok => [ok.file, ok.fileId])
    );

    clearHashFiles();

    // allTasks의 모든 File 객체에 대해 hashFiles 업데이트
    // 성공한 것: 새로운 fileId
    // 업로드되지 않은 것: driveFileId 속성 또는 이전 캐시에서 찾기
    for (const { file, id: imageId } of allTasks) {
      if (file instanceof File) {
        const fileKey = await getFileKey(file, imageId);
        // 이번 업로드에서 성공한 파일인가?
        const newFileId = successfulFilesMap.get(file);
        if (newFileId) {
          setHashFiles(`${fileKey}::${newFileId}`);
        } else {
          // 이전에 업로드된 파일인가? (driveFileId 속성 확인)
          const oldFileId = (file as any).driveFileId;
          if (oldFileId) {
            setHashFiles(`${fileKey}::${oldFileId}`);
          }
        }
      }
    }

    clearCleanUpFiles();
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setIsFail(false);

      // 전체 task (invitationImage 보존용)
      const allTasks = editorData.images.flatMap(item =>
        item.file.map(file => ({ id: item.id, file }))
      );

      // hashFiles를 빠른 조회를 위해 Map으로 변환: fileKey -> driveFileId
      const hashFileMap = new Map(
        hashFiles.map(h => {
          const [key, driveFileId] = h.split('::');
          return [key, driveFileId];
        })
      );

      // 드라이브에 이미 존재하는 파일은 업로드 제외, cleanUpFiles에 기록
      const newTasks: typeof allTasks = [];
      for (const task of allTasks) {
        if (!(task.file instanceof File)) {
          newTasks.push(task);
          continue;
        }
        // imageId(task.id)와 파일을 함께 사용하여 같은 파일도 이미지별로 구분
        const fileKey = await getFileKey(task.file, task.id);
        const existingFileId = hashFileMap.get(fileKey);
        if (existingFileId) {
          setCleanUpFiles(existingFileId);
          // 새 File 인스턴스에 driveFileId 주입 → replaceFiles에서 교체 가능해짐
          Object.defineProperty(task.file, 'driveFileId', {
            value: existingFileId,
            writable: true,
            configurable: true,
            enumerable: false,
          });
        } else {
          newTasks.push(task);
        }
      }

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
          images: allTasks as { id: string; file: File }[],
          uploadImages: newTasks as { id: string; file: File }[],
          audio: userFile,
          data: editorData.block,
          shareUrl: editorData.shareUrl,
          bgmData, // bgm의 data 버전.
          mainPoster,
          invitationThumbnail,
        });
        await applySaveResult(saveResult, allTasks);
      } else {
        const result = hasPreparedInvitation(editorData.invitationUuid)
          ? true
          : await trashFolder();
        //실패 토스트 알람 표시
        if (!result) {
          setIsLoading(false);
          setIsFail(true);
          return;
        }
        const saveResult = await saveInvitationFlow({
          bulkData,
          images: allTasks as { id: string; file: File }[],
          uploadImages: newTasks as { id: string; file: File }[],
          audio: userFile,
          data: editorData.block,
          shareUrl: editorData.shareUrl,
          bgmData, // bgm의 data 버전.
          mainPoster,
          invitationThumbnail,
          invitationUuid: editorData.invitationUuid,
        });
        await applySaveResult(saveResult, allTasks);
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
