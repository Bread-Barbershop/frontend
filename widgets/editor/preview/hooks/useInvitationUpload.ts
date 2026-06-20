import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { hasPreparedInvitation } from '@/features/invitation/save/prepareCache';
import {
  saveInvitationFlow,
  type SaveProgressStep,
} from '@/features/invitation/save/saveInvitationFlow';
import type { DashboardPendingInvitation } from '@/shared/constants/dashboardPendingInvitation';
import { useToast } from '@/shared/hooks/useToast';
import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import { getFileKey } from '@/shared/utils/fileUtils';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

const SAVE_PROGRESS_MESSAGES: Record<SaveProgressStep, string> = {
  checkingContent: '소중한 내용을 확인하고 있어요',
  organizingContent: '초대장에 담을 내용을 정리하고 있어요',
  collectingText: '작성한 문구를 차근차근 담고 있어요',
  loadingPhotos: '소중한 사진을 불러오고 있어요',
  arrangingContent: '사진과 문구를 보기 좋게 배치하고 있어요',
  polishingInvitation: '초대장의 전체 모습을 다듬고 있어요',
  reviewingDetails: '작은 부분까지 꼼꼼하게 살펴보고 있어요',
  checkingPresentation: '더 예쁘게 보이도록 확인하고 있어요',
  finishingInvitation: '이제 거의 다 완성됐어요',
};

const SAVE_PROGRESS_ORDER: Record<SaveProgressStep, number> = {
  checkingContent: 0,
  organizingContent: 1,
  collectingText: 2,
  loadingPhotos: 3,
  arrangingContent: 4,
  polishingInvitation: 5,
  reviewingDetails: 6,
  checkingPresentation: 7,
  finishingInvitation: 8,
};

const MIN_SAVE_PROGRESS_MESSAGE_MS = 2000;

export const useInvitationUpload = () => {
  const editorData = useEditorStore(useShallow(selectUploadData));
  const {
    hashFiles,
    setHashFiles,
    setCleanUpFiles,
    clearHashFiles,
    clearCleanUpFiles,
  } = useEditorStore(
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
  const [loadingMessage, setLoadingMessage] = useState(
    SAVE_PROGRESS_MESSAGES.checkingContent
  );
  const currentProgressStepRef =
    useRef<SaveProgressStep>('checkingContent');
  const pendingProgressStepRef = useRef<SaveProgressStep | null>(null);
  const progressMessageShownAtRef = useRef(0);
  const progressMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isSaveLoadingRef = useRef(false);
  const [isFail, setIsFail] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [pendingInvitation, setPendingInvitation] =
    useState<DashboardPendingInvitation | null>(null);
  const { info, success, error: showError } = useToast();

  const clearProgressMessageTimer = useCallback(() => {
    if (progressMessageTimerRef.current === null) return;
    clearTimeout(progressMessageTimerRef.current);
    progressMessageTimerRef.current = null;
  }, []);

  const showProgressStep = useCallback((step: SaveProgressStep) => {
    currentProgressStepRef.current = step;
    progressMessageShownAtRef.current = Date.now();
    setLoadingMessage(SAVE_PROGRESS_MESSAGES[step]);
  }, []);

  const flushPendingProgressStep = useCallback(() => {
    progressMessageTimerRef.current = null;

    if (!isSaveLoadingRef.current) {
      pendingProgressStepRef.current = null;
      return;
    }

    const pendingStep = pendingProgressStepRef.current;
    pendingProgressStepRef.current = null;

    if (!pendingStep || pendingStep === currentProgressStepRef.current) {
      return;
    }

    showProgressStep(pendingStep);
  }, [showProgressStep]);

  const queueProgressStep = useCallback(
    (step: SaveProgressStep) => {
      if (
        SAVE_PROGRESS_ORDER[step] <
        SAVE_PROGRESS_ORDER[currentProgressStepRef.current]
      ) {
        return;
      }

      if (!isSaveLoadingRef.current) {
        showProgressStep(step);
        return;
      }

      if (step === currentProgressStepRef.current) {
        return;
      }

      const elapsed = Date.now() - progressMessageShownAtRef.current;

      if (elapsed >= MIN_SAVE_PROGRESS_MESSAGE_MS) {
        pendingProgressStepRef.current = null;
        clearProgressMessageTimer();
        showProgressStep(step);
        return;
      }

      pendingProgressStepRef.current = step;

      if (progressMessageTimerRef.current !== null) {
        return;
      }

      progressMessageTimerRef.current = setTimeout(
        flushPendingProgressStep,
        MIN_SAVE_PROGRESS_MESSAGE_MS - elapsed
      );
    },
    [clearProgressMessageTimer, flushPendingProgressStep, showProgressStep]
  );

  useEffect(() => clearProgressMessageTimer, [clearProgressMessageTimer]);

  const applySaveResult = async (
    saveResult: Awaited<ReturnType<typeof saveInvitationFlow>>,
    allTasks: { id: string; file: File | string }[]
  ) => {
    console.log(
      '[applySaveResult] 시작, saveResult.success:',
      saveResult.success
    );
    if (!saveResult.success) {
      console.error('[applySaveResult] 저장 실패:', saveResult.results);
      throw new Error('Invitation save failed.');
    }

    editorData.setInvitationUuid(saveResult.invitationUuid);
    editorData.setImageFolderId(saveResult.folders.imageFolderId);
    editorData.setAudioFolderId(saveResult.folders.audioFolderId);
    editorData.setInvitationFolderId(saveResult.folders.invitationFolderId);
    setPendingInvitation({
      invitationFolderId: saveResult.folders.invitationFolderId,
      invitationUuid: saveResult.invitationUuid,
      dataJsonFileId: saveResult.files.dataJsonFileId,
      guestUrl: saveResult.guestUrl,
      thumbnailFileId: saveResult.files.thumbnailFileId,
      published: saveResult.visibility.published,
      ready: saveResult.visibility.ready,
      createdAt: new Date().toISOString(),
    });
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
          console.log(
            '[applySaveResult] 신규 업로드 파일 등록:',
            imageId,
            '→',
            newFileId
          );
          setHashFiles(`${fileKey}::${newFileId}`);
        } else {
          // 이전에 업로드된 파일인가? (driveFileId 속성 확인)
          const oldFileId = (file as any).driveFileId;
          if (oldFileId) {
            console.log(
              '[applySaveResult] 재사용 파일 등록:',
              imageId,
              '→',
              oldFileId
            );
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
    info('파일 정리 중...', { placement: 'top-right' });

    try {
      const deleteFolder = (id: string) =>
        fetch('/api/drive/deleteInvitation', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: id }),
        });

      const attempt = async (ids: string[]) => {
        console.log('[cleanup] DELETE 요청 시작:', ids.length, 'items');
        const results = await Promise.allSettled(ids.map(deleteFolder));
        return ids.filter((id, idx) => {
          const result = results[idx];
          return result.status === 'rejected' || !result.value.ok;
        });
      };

      let failedIds = await attempt(fileIds);
      if (failedIds.length > 0) {
        console.warn('[cleanup] 실패 항목 재시도:', failedIds);
        failedIds = await attempt(failedIds);
      }

      if (failedIds.length > 0) {
        console.error('[cleanup] 재시도 후에도 삭제 실패:', failedIds);
        showError('파일 정리에 실패했습니다.', { placement: 'top-right' });
      } else {
        success('파일 정리가 완료되었습니다.', { placement: 'top-right' });
      }
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
      isSaveLoadingRef.current = true;
      pendingProgressStepRef.current = null;
      clearProgressMessageTimer();
      showProgressStep('checkingContent');
      setIsLoading(true);
      setIsFail(false);
      setPendingInvitation(null);

      // 전체 task (invitationImage 보존용)
      const allTasks = editorData.images.flatMap(item =>
        item.file.map(file => ({ id: item.id, file }))
      );
      queueProgressStep('organizingContent');
      console.log('[uploadFlow] allTasks:', allTasks.length, 'items');

      // 이전 hashFiles의 fileId들을 캡처
      const oldHashFileIds = new Set(
        hashFiles.map(h => h.split('::')[1]).filter(Boolean)
      );
      console.log(
        '[uploadFlow] oldHashFileIds (저장 전):',
        Array.from(oldHashFileIds)
      );

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
      console.log(
        '[uploadFlow] newTasks (신규 업로드):',
        newTasks.length,
        'items'
      );
      queueProgressStep('collectingText');

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
          onProgress: queueProgressStep,
        });
        console.log('[uploadFlow] saveInvitationFlow 완료');
        await applySaveResult(saveResult, allTasks);
        console.log('[uploadFlow] applySaveResult 완료');
        useEditorStore.getState().setIsDirty(false);
      } else {
        console.log(
          '[uploadFlow] 재저장 (invitationUuid:',
          editorData.invitationUuid,
          ')'
        );
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
          onProgress: queueProgressStep,
        });
        console.log('[uploadFlow] saveInvitationFlow 완료');
        await applySaveResult(saveResult, allTasks);
        console.log('[uploadFlow] applySaveResult 완료');
        useEditorStore.getState().setIsDirty(false);

        // 클린업 대상 계산 및 실행 (non-blocking)
        const newHashFileIds = new Set(
          useEditorStore
            .getState()
            .hashFiles.map(h => h.split('::')[1])
            .filter(Boolean)
        );
        console.log(
          '[uploadFlow] newHashFileIds (저장 후):',
          Array.from(newHashFileIds)
        );
        const toCleanIds = [...oldHashFileIds].filter(
          id => !newHashFileIds.has(id)
        );
        console.log('[uploadFlow] 삭제 대상 fileIds:', toCleanIds);
        toCleanIds.forEach(id => setCleanUpFiles(id));
        performCleanup(toCleanIds);
      }
    } catch (error) {
      console.error('[uploadFlow] 저장 중 오류 발생:', error);
      setIsFail(true);
    } finally {
      console.log('[uploadFlow] handleUpload finally - isLoading=false');
      isSaveLoadingRef.current = false;
      pendingProgressStepRef.current = null;
      clearProgressMessageTimer();
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
    pendingInvitation,
    loadingMessage,
  };
};
