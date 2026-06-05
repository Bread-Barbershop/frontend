import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { hasPreparedInvitation } from '@/features/invitation/save/prepareCache';
import { saveInvitationFlow } from '@/features/invitation/save/saveInvitationFlow';
import { useToast } from '@/shared/hooks/useToast';
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
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { info, success } = useToast();

  const applySaveResult = async (
    saveResult: Awaited<ReturnType<typeof saveInvitationFlow>>,
    allTasks: { id: string; file: File | string }[]
  ) => {
    console.log('[applySaveResult] 시작, saveResult.success:', saveResult.success);
    if (!saveResult.success) {
      console.error('[applySaveResult] 저장 실패:', saveResult.results);
      throw new Error('Invitation save failed.');
    }

    editorData.setInvitationUuid(saveResult.invitationUuid);
    editorData.setImageFolderId(saveResult.folders.imageFolderId);
    editorData.setAudioFolderId(saveResult.folders.audioFolderId);
    editorData.setInvitationFolderId(saveResult.folders.invitationFolderId);
    console.log('[applySaveResult] folderIds 설정 완료');

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
    console.log('[applySaveResult] hashFiles 초기화');

    // allTasks의 모든 File 객체에 대해 hashFiles 업데이트
    // 성공한 것: 새로운 fileId
    // 업로드되지 않은 것: driveFileId 속성 또는 이전 캐시에서 찾기
    for (const { file, id: imageId } of allTasks) {
      if (file instanceof File) {
        const fileKey = await getFileKey(file, imageId);
        // 이번 업로드에서 성공한 파일인가?
        const newFileId = successfulFilesMap.get(file);
        if (newFileId) {
          console.log('[applySaveResult] 신규 업로드 파일 등록:', imageId, '→', newFileId);
          setHashFiles(`${fileKey}::${newFileId}`);
        } else {
          // 이전에 업로드된 파일인가? (driveFileId 속성 확인)
          const oldFileId = (file as any).driveFileId;
          if (oldFileId) {
            console.log('[applySaveResult] 재사용 파일 등록:', imageId, '→', oldFileId);
            setHashFiles(`${fileKey}::${oldFileId}`);
          }
        }
      }
    }
    console.log('[applySaveResult] hashFiles 업데이트 완료');
  };

  const performCleanup = async (fileIds: string[]) => {
    console.log('[cleanup] performCleanup 시작', 'fileIds:', fileIds);
    if (fileIds.length === 0) {
      console.log('[cleanup] 삭제할 파일이 없습니다');
      return;
    }

    setIsCleaningUp(true);
    console.log('[cleanup] isCleaningUp=true, 토스트 표시 시작');
    info('파일 정리 중...', 'right', 'top');

    try {
      console.log('[cleanup] DELETE 요청 시작:', fileIds.length, 'items');
      const results = await Promise.allSettled(
        fileIds.map(id =>
          fetch('/api/drive/deleteInvitation', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId: id }),
          })
        )
      );
      const fulfilled = results.filter(r => r.status === 'fulfilled').length;
      const rejected = results.filter(r => r.status === 'rejected').length;
      console.log('[cleanup] DELETE 완료 - 성공:', fulfilled, ', 실패:', rejected);
      success('파일 정리가 완료되었습니다.', 'right', 'top');
    } catch (error) {
      console.error('[cleanup] DELETE 중 오류:', error);
    } finally {
      console.log('[cleanup] 정리 중 상태 해제');
      clearCleanUpFiles();
      setIsCleaningUp(false);
      console.log('[cleanup] isCleaningUp=false');
    }
  };

  const handleUpload = async () => {
    try {
      console.log('[uploadFlow] handleUpload 시작');
      setIsLoading(true);
      setIsFail(false);

      // 전체 task (invitationImage 보존용)
      const allTasks = editorData.images.flatMap(item =>
        item.file.map(file => ({ id: item.id, file }))
      );
      console.log('[uploadFlow] allTasks:', allTasks.length, 'items');

      // 이전 hashFiles의 fileId들을 캡처
      const oldHashFileIds = new Set(
        hashFiles.map(h => h.split('::')[1]).filter(Boolean)
      );
      console.log('[uploadFlow] oldHashFileIds (저장 전):', Array.from(oldHashFileIds));

      // hashFiles를 빠른 조회를 위해 Map으로 변환: fileKey -> driveFileId
      const hashFileMap = new Map(
        hashFiles.map(h => {
          const [key, driveFileId] = h.split('::');
          return [key, driveFileId];
        })
      );

      // 드라이브에 이미 존재하는 파일은 업로드 제외
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
          console.log('[uploadFlow] 재사용 파일:', existingFileId);
          // 새 File 인스턴스에 driveFileId 주입 → replaceFiles에서 교체 가능해짐
          Object.defineProperty(task.file, 'driveFileId', {
            value: existingFileId,
            writable: true,
            configurable: true,
            enumerable: false,
          });
        } else {
          console.log('[uploadFlow] 신규 업로드 파일:', task.id);
          newTasks.push(task);
        }
      }
      console.log('[uploadFlow] newTasks (신규 업로드):', newTasks.length, 'items');

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
        console.log('[uploadFlow] 신규 저장 (invitationUuid 없음)');
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
        console.log('[uploadFlow] saveInvitationFlow 완료');
        await applySaveResult(saveResult, allTasks);
        console.log('[uploadFlow] applySaveResult 완료');

        // 클린업 대상 계산 및 실행 (non-blocking)
        const newHashFileIds = new Set(
          useEditorStore.getState().hashFiles.map(h => h.split('::')[1]).filter(Boolean)
        );
        console.log('[uploadFlow] newHashFileIds (저장 후):', Array.from(newHashFileIds));
        const toCleanIds = [...oldHashFileIds].filter(id => !newHashFileIds.has(id));
        console.log('[uploadFlow] 삭제 대상 fileIds:', toCleanIds);
        toCleanIds.forEach(id => setCleanUpFiles(id));
        performCleanup(toCleanIds);
      } else {
        console.log('[uploadFlow] 재저장 (invitationUuid:', editorData.invitationUuid, ')');
        const result = hasPreparedInvitation(editorData.invitationUuid)
          ? true
          : await trashFolder();
        //실패 토스트 알람 표시
        if (!result) {
          console.log('[uploadFlow] 폴더 삭제 실패');
          setIsLoading(false);
          setIsFail(true);
          return;
        }
        console.log('[uploadFlow] 폴더 준비 완료');
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
        console.log('[uploadFlow] saveInvitationFlow 완료');
        await applySaveResult(saveResult, allTasks);
        console.log('[uploadFlow] applySaveResult 완료');

        // 클린업 대상 계산 및 실행 (non-blocking)
        const newHashFileIds = new Set(
          useEditorStore.getState().hashFiles.map(h => h.split('::')[1]).filter(Boolean)
        );
        console.log('[uploadFlow] newHashFileIds (저장 후):', Array.from(newHashFileIds));
        const toCleanIds = [...oldHashFileIds].filter(id => !newHashFileIds.has(id));
        console.log('[uploadFlow] 삭제 대상 fileIds:', toCleanIds);
        toCleanIds.forEach(id => setCleanUpFiles(id));
        performCleanup(toCleanIds);
      }
    } catch (error) {
      console.error('[uploadFlow] 저장 중 오류 발생:', error);
      setIsFail(true);
    } finally {
      console.log('[uploadFlow] handleUpload finally - isLoading=false');
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
    isCleaningUp,
  };
};
