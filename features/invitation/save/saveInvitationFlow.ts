import type {
  EditorBlock,
  PersistedEditorBlock,
  ShareUrlState,
} from '@/shared/types/block';
import type {
  BgmData,
  BulkJson,
  InvitationPayload,
  InvitationThumbnail,
  MainPosterData,
  UploadTask,
} from '@/shared/types/invitationSave';
import {
  resolveShareDescription,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

import { createGuestRenderHints } from './createGuestRenderHints';
import {
  getPreparedInvitation,
  invalidatePreparedInvitation,
  isPreparedTokenValid,
  normalizeExpiresAt,
  runPrepareOnce,
  setPreparedInvitation,
  updatePreparedAccessToken,
  type PreparedInvitationSave,
} from './prepareCache';
import { retryFailedOnce } from './retryFailedOnce';
import { retryPatchFailedOnce } from './retryPatchFailedOnce';
import { shouldPrepareFallback } from './saveFallback';
import { updateFileToDrive } from './updateFileToDrive';
import {
  uploadAllSettled,
  type UploadFail,
  type UploadOk,
} from './uploadAllSettled';

type SaveInvitationPrepareResponse = {
  workspaceFolderId: string;
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  imageFolderId: string;
  audioFolderId: string;
  accessToken: string;
  expiresAt: string | number;
  meta?: unknown;
};

type BatchResult = { ok: UploadOk[]; fail: UploadFail[] };

export type SaveProgressStep =
  | 'checking'
  | 'collecting'
  | 'finishing'
  | 'almostDone';

type SaveInvitationFlowParams = {
  bulkData: BulkJson;
  images: UploadTask[];
  audio: File | null;
  data: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  bgmData: BgmData;
  invitationUuid?: string;
  mainPoster: MainPosterData;
  invitationThumbnail: InvitationThumbnail;
  uploadImages?: UploadTask[];
  onProgress?: (step: SaveProgressStep) => void;
};

type SaveInvitationFlowResult = {
  success: boolean;
  invitationUuid: string;
  guestUrl: string;
  results: {
    images: BatchResult;
    audio: BatchResult;
    data: BatchResult;
  };
  files: {
    dataJsonFileId: string;
    thumbnailFileId?: string;
  };
  folders: {
    workspaceFolderId: string;
    invitationFolderId: string;
    imageFolderId: string;
    audioFolderId: string;
  };
  debug: {
    refreshedToken: boolean;
    usedAccessToken: string;
  };
  visibility: {
    attempted: boolean;
    ok: boolean;
    published: boolean;
    ready?: boolean;
    error?: string;
    status?: number;
  };
};

type StepResult = {
  final: BatchResult;
  usedAccessToken: string;
};

type TokenState = {
  currentToken: string;
  currentExpiresAt: number;
  refreshedToken: boolean;
  refreshAccessToken: () => Promise<string>;
};

type UploadResult = {
  imagesStep: StepResult;
  audioStep: StepResult;
  fileToId: Map<File, string>;
  uploadedAudioFileId: string | null;
};

type CommitResult = {
  dataStep: StepResult;
  thumbnailSaveFailed: boolean;
  metaSaveFailed: boolean;
  thumbnailFileId?: string;
};

type VisibilityResponsePayload = {
  ok?: boolean;
  published?: boolean;
  ready?: boolean;
  guestUrl?: string;
  dataJsonFileId?: string;
  error?: string;
  status?: number;
};

type InitialVisibilityResult = SaveInvitationFlowResult['visibility'];

function toPreparedInvitationSave(
  response: SaveInvitationPrepareResponse
): PreparedInvitationSave {
  return {
    ...response,
    expiresAt: normalizeExpiresAt(response.expiresAt),
  };
}

async function requestPrepare(
  invitationUuid: string | undefined
): Promise<PreparedInvitationSave> {
  const prepRes = await fetch('/api/drive/saveInvitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationUuid }),
  });

  if (!prepRes.ok) {
    throw new Error(`saveInvitation prepare failed: ${prepRes.status}`);
  }

  return toPreparedInvitationSave(
    (await prepRes.json()) as SaveInvitationPrepareResponse
  );
}

// prepare: 저장에 필요한 Drive 폴더, data.json, access token을 준비한다.
// 캐시된 Drive 구조가 있으면 재사용하고, token만 만료되었으면 token만 갱신한다.
async function prepare(
  invitationUuid: string | undefined
): Promise<PreparedInvitationSave> {
  const cached = getPreparedInvitation(invitationUuid);

  if (cached) {
    return isPreparedTokenValid(cached)
      ? cached
      : await getFreshPreparedAccessToken(cached);
  }

  return runPrepareOnce({
    invitationUuid,
    run: () => requestPrepare(invitationUuid),
  });
}

// upload/commit 단계에서 같은 토큰 상태를 공유한다.
// 401 재시도 중 토큰이 갱신되면 이후 단계도 갱신된 토큰을 사용한다.
function createTokenState(prep: PreparedInvitationSave): TokenState {
  const token: TokenState = {
    currentToken: prep.accessToken,
    currentExpiresAt: prep.expiresAt,
    refreshedToken: false,
    refreshAccessToken: async () => {
      const r = await fetch('/api/drive/getToken', { method: 'POST' });
      if (!r.ok) throw new Error(`refresh-token failed: ${r.status}`);
      const j = await r.json();

      token.currentToken = j.accessToken as string;
      token.currentExpiresAt = normalizeExpiresAt(
        j.expiresAt as string | number
      );
      token.refreshedToken = true;
      updatePreparedAccessToken({
        invitationUuid: prep.invitationUuid,
        accessToken: token.currentToken,
        expiresAt: token.currentExpiresAt,
      });

      return token.currentToken;
    },
  };

  return token;
}

// upload: 현재 저장에 필요한 이미지와 오디오 파일을 Drive에 업로드한다.
// 아직 기존 fileId 재사용 판단은 하지 않고, 전달받은 파일 업로드와 재시도만 담당한다.
async function upload(params: {
  prep: PreparedInvitationSave;
  images: UploadTask[];
  audio: File | null;
  token: TokenState;
}): Promise<UploadResult> {
  const { prep, images, audio, token } = params;

  // 공통 업로드 실행기: 1차 업로드 후 실패한 파일만 1회 재시도한다.
  const runUploadStep = async (step: {
    folderId: string;
    originFile: UploadTask[];
    concurrency?: number;
  }): Promise<StepResult> => {
    if (step.originFile.length === 0) {
      return {
        final: { ok: [], fail: [] },
        usedAccessToken: token.currentToken,
      };
    }

    const firstAttempt = await uploadAllSettled({
      originFile: step.originFile,
      folderId: step.folderId,
      accessToken: token.currentToken,
      concurrency: step.concurrency,
    });

    const retryAttempt = firstAttempt.fail.length
      ? await retryFailedOnce({
          failures: firstAttempt.fail,
          folderId: step.folderId,
          accessToken: token.currentToken,
          refreshAccessToken: token.refreshAccessToken,
        })
      : {
          ok: [],
          fail: [],
          refreshedToken: false,
          usedAccessToken: token.currentToken,
        };

    if (retryAttempt.refreshedToken) {
      token.currentToken = retryAttempt.usedAccessToken;
    }

    return {
      final: {
        ok: [...firstAttempt.ok, ...retryAttempt.ok],
        fail: retryAttempt.fail,
      },
      usedAccessToken: token.currentToken,
    };
  };

  const imagesStep = await runUploadStep({
    originFile: images,
    folderId: prep.imageFolderId,
    concurrency: 5,
  });

  const fileToId = new Map<File, string>();
  imagesStep.final.ok.forEach(ok => {
    fileToId.set(ok.file, ok.fileId);
    // 업로드된 File 객체에 driveFileId 속성 설정 (commit에서 사용)
    Object.defineProperty(ok.file, 'driveFileId', {
      value: ok.fileId,
      writable: false,
      configurable: true,
      enumerable: false,
    });
  });

  const audioStep = await runUploadStep({
    originFile: audio ? [{ id: 'bgm', file: audio }] : [],
    folderId: prep.audioFolderId,
  });

  return {
    imagesStep,
    audioStep,
    fileToId,
    uploadedAudioFileId: audioStep.final.ok[0]?.fileId ?? null,
  };
}

// commit: 업로드 결과를 현재 에디터 데이터에 반영하고 data.json을 최종 업데이트한다.
// 현재는 기존 동작 유지를 위해 공유 데이터와 썸네일 저장도 이 단계에서 함께 처리한다.
async function commit(params: {
  prep: PreparedInvitationSave;
  token: TokenState;
  uploadResult: UploadResult;
  bulkData: BulkJson;
  images: UploadTask[];
  uploadImages?: UploadTask[];
  data: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  bgmData: BgmData;
  mainPoster: MainPosterData;
  invitationThumbnail: InvitationThumbnail;
}): Promise<CommitResult> {
  const {
    prep,
    token,
    uploadResult,
    bulkData,
    images,
    uploadImages,
    data,
    shareUrl,
    bgmData,
    mainPoster,
    invitationThumbnail,
  } = params;
  const { fileToId, uploadedAudioFileId } = uploadResult;

  // uploadImages의 imageId -> File 매핑 (중복 이미지 처리용)
  const uploadImagesByImageId = new Map(
    (uploadImages ?? []).map(task => [task.id, task.file as File])
  );

  const invitationUrl = `${window.location.origin}/guest/${prep.dataJsonFileId}`;

  // 공유 URL 메타데이터가 비어 있으면 기본 문구로 보정한다.
  const normalizedShareUrl: ShareUrlState = {
    ...shareUrl,
    title: resolveShareTitle(shareUrl.title), // 카카오톡 공유 타이틀
    description: resolveShareDescription(shareUrl.description), // 카카오톡 공유 설명
    urlTitle: resolveShareTitle(shareUrl.urlTitle), // 썸네일 (메타데이터) 공유 타이틀
    urlDescription: resolveShareDescription(shareUrl.urlDescription), // 썸네일 (메타데이터) 공유 설명
  };

  // images의 File 객체들을 위해 imageId -> fileId 매핑 생성
  // (중복 이미지의 경우 imageId를 기반으로 찾음)
  const imageIdToFileId = new Map<string, string>();
  images.forEach(task => {
    if (task.file instanceof File) {
      // 1차: uploadImages에 있는 같은 File을 찾기
      const uploadedFile = uploadImagesByImageId.get(task.id);
      if (uploadedFile && fileToId.has(uploadedFile)) {
        imageIdToFileId.set(task.id, fileToId.get(uploadedFile)!);
      } else if (fileToId.has(task.file)) {
        // 2차: fileToId에 직접 있는지 확인
        imageIdToFileId.set(task.id, fileToId.get(task.file)!);
      } else if ((task.file as any).driveFileId) {
        // 3차: 기존 driveFileId 속성 사용
        imageIdToFileId.set(task.id, (task.file as any).driveFileId);
      } else {
        console.warn(
          `File not uploaded and no driveFileId for image ${task.id}: ${task.file.name}`
        );
      }
    }
  });

  // 에디터 상태 안에 남아 있는 File 객체를 Drive fileId로 치환한다.
  // 문제: 중복 이미지의 경우 File 객체 참조가 다를 수 있으므로,
  // replaceFiles에서는 fileToId에 없는 File도 발생 가능
  // 해결: 발생하면 driveFileId 속성을 확인하고, 없으면 경고만 출력하고 진행
  const replaceFiles = (obj: unknown): unknown => {
    if (obj instanceof File) {
      const fileId = fileToId.get(obj) ?? (obj as any).driveFileId;
      if (!fileId) {
        console.warn('File not uploaded and no driveFileId found:', obj.name);
        // 에러 대신 더 이상 진행하지 않음 (다시 시도할 기회 없음)
        // 대신 imageId 기반 매핑에서 찾을 수 있도록 위에서 처리
        throw new Error(`not Found Image FileId: ${obj.name}`);
      }
      return fileId;
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceFiles);
    }
    if (obj !== null && typeof obj === 'object') {
      const newObj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceFiles(value);
      }
      return newObj;
    }
    return obj;
  };
  const replacedShareUrl = replaceFiles(normalizedShareUrl) as ShareUrlState;

  // block props 내부의 File도 같은 기준으로 치환해 data.json에 직렬화 가능한 값만 남긴다.
  const newData = data.map(item => ({
    ...item,
    props: replaceFiles(item.props) as typeof item.props,
  }));

  const isUserBgmSelected = bgmData.selectedBgmId === 'user-bgm';

  const finalBgm: BgmData = {
    ...bgmData,
    userBgmFileId: isUserBgmSelected
      ? (uploadedAudioFileId ?? bgmData.userBgmFileId ?? null)
      : null,
  };

  let thumbnailFileId: string | undefined = undefined;
  let thumbnailSaveFailed = false;

  // 초대장 썸네일 데이터 먼저 저장하여 URL(fileId) 확보
  if (invitationThumbnail && invitationThumbnail.dataUrl) {
    try {
      const thumbnailResponse = await fetch('/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: prep.invitationFolderId,
          thumbnailData: invitationThumbnail,
        }),
      });
      if (!thumbnailResponse.ok) {
        throw new Error(`thumbnail save failed: ${thumbnailResponse.status}`);
      }
      const thumbnailResult = await thumbnailResponse.json();
      if (typeof thumbnailResult?.thumbnailFileId !== 'string') {
        throw new Error('thumbnail save response missing thumbnailFileId');
      }
      thumbnailFileId = thumbnailResult.thumbnailFileId;
    } catch (error) {
      thumbnailSaveFailed = true;
      console.error('초대장 썸네일 데이터 저장 실패:', error);
    }
  }

  const finalMainPoster: MainPosterData = {
    ...mainPoster,
    thumbnailFileId: thumbnailFileId ?? mainPoster.thumbnailFileId,
  };
  // 게스트 페이지가 첫 렌더에 필요한 폰트/이미지 후보를 빠르게 알 수 있도록 저장 payload에 힌트를 함께 넣는다.
  const renderHints = createGuestRenderHints({
    bulkData,
    blocks: newData,
    shareUrl: replacedShareUrl,
    mainPoster: finalMainPoster,
  });

  const payload: InvitationPayload = {
    bulkData,
    blocks: newData,
    shareUrl: replacedShareUrl,
    bgm: finalBgm,
    mainPoster: finalMainPoster,
    invitationImage: images,
    renderHints,
  };

  const dataFile = new File([JSON.stringify(payload)], 'data.json', {
    type: 'application/json',
  });

  // data.json PATCH가 저장 완료의 핵심 단계다. 실패하면 401/5xx에 한해 1회 재시도한다.
  const dataFirstAttempt: BatchResult = await (async () => {
    try {
      const result = await updateFileToDrive(
        dataFile,
        prep.dataJsonFileId,
        token.currentToken
      );
      return {
        ok: [{ file: dataFile, ...result } satisfies UploadOk],
        fail: [],
      };
    } catch (error) {
      return { ok: [], fail: [{ file: dataFile, error }] };
    }
  })();

  const dataRetryAttempt = await retryPatchFailedOnce({
    failures: dataFirstAttempt.fail,
    fileId: prep.dataJsonFileId,
    accessToken: token.currentToken,
    refreshAccessToken: token.refreshAccessToken,
  });

  if (dataRetryAttempt.refreshedToken) {
    token.currentToken = dataRetryAttempt.usedAccessToken;
  }

  const dataStep: StepResult = {
    final: {
      ok: [...dataFirstAttempt.ok, ...dataRetryAttempt.ok],
      fail: dataRetryAttempt.fail,
    },
    usedAccessToken: token.currentToken,
  };

  // 공유 데이터 저장 실패는 기존 정책대로 전체 저장 실패로 보지 않는다.
  let metaSaveFailed = false;

  try {
    const primaryImage =
      replacedShareUrl.images?.[0] ?? replacedShareUrl.urlImage?.[0];

    const imageFileId =
      typeof primaryImage === 'string'
        ? primaryImage.trim() || undefined
        : primaryImage instanceof File
          ? fileToId.get(primaryImage)
          : undefined;

    const placeBlock = data.find(
      (item): item is EditorBlock<'place'> => item.component === 'place'
    );
    const hasValidLocation = Boolean(
      placeBlock &&
      typeof placeBlock.props.lat === 'number' &&
      typeof placeBlock.props.lng === 'number'
    );
    const showLocationButton =
      hasValidLocation && normalizedShareUrl.showLocationButton;

    const shareRes = await fetch('/api/drive/shareUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationFolderId: prep.invitationFolderId,
        dataJsonFileId: prep.dataJsonFileId,
        shareData: {
          title: normalizedShareUrl.title,
          description: normalizedShareUrl.description,
          imageFileId,
          showLocationButton,
          invitationUrl,
          locationInfo: showLocationButton
            ? normalizedShareUrl.locationInfo
            : undefined,
        },
      }),
    });
    if (!shareRes.ok) {
      throw new Error(`shareUrl save failed: ${shareRes.status}`);
    }
  } catch (error) {
    metaSaveFailed = true;
    console.error('Share data save failed:', error);
  }

  return {
    dataStep,
    thumbnailSaveFailed,
    metaSaveFailed,
    thumbnailFileId: finalMainPoster.thumbnailFileId,
  };
}

async function getFreshPreparedAccessToken(
  prepared: PreparedInvitationSave
): Promise<PreparedInvitationSave> {
  const r = await fetch('/api/drive/getToken', { method: 'POST' });
  if (!r.ok) throw new Error(`refresh-token failed: ${r.status}`);
  const j = await r.json();

  return (
    updatePreparedAccessToken({
      invitationUuid: prepared.invitationUuid,
      accessToken: j.accessToken as string,
      expiresAt: j.expiresAt as string | number,
    }) ?? {
      ...prepared,
      accessToken: j.accessToken as string,
      expiresAt: normalizeExpiresAt(j.expiresAt as string | number),
    }
  );
}

async function prepareFallback(invitationUuid: string) {
  invalidatePreparedInvitation(invitationUuid);
  return runPrepareOnce({
    invitationUuid,
    run: () => requestPrepare(invitationUuid),
  });
}

async function requestInitialPublicVisibility(
  invitationFolderId: string
): Promise<InitialVisibilityResult> {
  try {
    const res = await fetch('/api/drive/invitationVisibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationFolderId,
        visible: true,
      }),
    });
    const payload = (await res
      .json()
      .catch(() => ({}))) as VisibilityResponsePayload;

    if (!res.ok || payload.ok === false) {
      return {
        attempted: true,
        ok: false,
        published: false,
        ready: false,
        error: payload.error ?? `visibility_publish_failed:${res.status}`,
        status: payload.status ?? res.status,
      };
    }

    return {
      attempted: true,
      ok: true,
      published: payload.published ?? true,
      ready: payload.ready,
      status: payload.status ?? res.status,
    };
  } catch (error) {
    return {
      attempted: true,
      ok: false,
      published: false,
      ready: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// saveInvitationFlow: 저장 버튼에서 호출되는 최상위 오케스트레이션 함수다.
// prepare -> upload -> commit 순서로 실행하고, 기존 UI가 기대하는 결과 형태를 그대로 반환한다.
export async function saveInvitationFlow(
  params: SaveInvitationFlowParams
): Promise<SaveInvitationFlowResult> {
  const {
    bulkData,
    images,
    audio,
    data,
    shareUrl,
    bgmData,
    invitationUuid,
    mainPoster,
    invitationThumbnail,
  } = params;

  params.onProgress?.('checking');
  let prep = await prepare(invitationUuid);
  let token = createTokenState(prep);
  params.onProgress?.('collecting');
  let uploadResult = await upload({
    prep,
    images: params.uploadImages ?? images,
    audio,
    token,
  });
  params.onProgress?.('finishing');
  let commitResult = await commit({
    prep,
    token,
    uploadResult,
    bulkData,
    images,
    uploadImages: params.uploadImages,
    data,
    shareUrl,
    bgmData,
    mainPoster,
    invitationThumbnail,
  });

  if (
    shouldPrepareFallback({
      imageFailures: uploadResult.imagesStep.final.fail,
      audioFailures: uploadResult.audioStep.final.fail,
      dataFailures: commitResult.dataStep.final.fail,
    })
  ) {
    params.onProgress?.('checking');
    prep = await prepareFallback(prep.invitationUuid);
    token = createTokenState(prep);
    params.onProgress?.('collecting');
    uploadResult = await upload({
      prep,
      images: params.uploadImages ?? images,
      audio,
      token,
    });
    params.onProgress?.('finishing');
    commitResult = await commit({
      prep,
      token,
      uploadResult,
      bulkData,
      images,
      uploadImages: params.uploadImages,
      data,
      shareUrl,
      bgmData,
      mainPoster,
      invitationThumbnail,
    });
  }

  const saveFailedBeforeVisibility =
    uploadResult.imagesStep.final.fail.length +
    uploadResult.audioStep.final.fail.length +
    commitResult.dataStep.final.fail.length +
    (commitResult.thumbnailSaveFailed ? 1 : 0) +
    (commitResult.metaSaveFailed ? 1 : 0);
  params.onProgress?.('almostDone');
  const visibility =
    saveFailedBeforeVisibility === 0
      ? await requestInitialPublicVisibility(prep.invitationFolderId)
      : {
          attempted: false,
          ok: false,
          published: false,
          ready: false,
        };

  setPreparedInvitation({
    ...prep,
    accessToken: token.currentToken,
    expiresAt: token.currentExpiresAt,
  });

  // 저장 필수 단계 또는 초기 공개 권한 처리 실패가 있으면 success=false다.
  const totalFailed =
    saveFailedBeforeVisibility +
    (visibility.attempted && !visibility.ok ? 1 : 0);

  return {
    success: totalFailed === 0,
    invitationUuid: prep.invitationUuid,
    guestUrl:
      typeof window !== 'undefined'
        ? `${window.location.origin}/guest/${prep.dataJsonFileId}`
        : `/guest/${prep.dataJsonFileId}`,
    results: {
      images: uploadResult.imagesStep.final,
      audio: uploadResult.audioStep.final,
      data: commitResult.dataStep.final,
    },
    files: {
      dataJsonFileId: prep.dataJsonFileId,
      thumbnailFileId: commitResult.thumbnailFileId,
    },
    folders: {
      workspaceFolderId: prep.workspaceFolderId,
      invitationFolderId: prep.invitationFolderId,
      imageFolderId: prep.imageFolderId,
      audioFolderId: prep.audioFolderId,
    },
    debug: {
      refreshedToken: token.refreshedToken,
      usedAccessToken: token.currentToken,
    },
    visibility,
  };
}
