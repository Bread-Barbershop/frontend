import type { PersistedEditorBlock, ShareUrlState } from '@/shared/types/block';
import type {
  BgmData,
  BulkJson,
  InvitationPayload,
  InvitationThumbnail,
  MainPosterData,
  UploadTask,
} from '@/shared/types/invitationSave';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/shared/utils/shareUrlDefaults';

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
};

type SaveInvitationFlowResult = {
  success: boolean;
  invitationUuid: string;
  results: {
    images: BatchResult;
    audio: BatchResult;
    data: BatchResult;
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
};

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
    data,
    shareUrl,
    bgmData,
    mainPoster,
    invitationThumbnail,
  } = params;
  const { fileToId, uploadedAudioFileId } = uploadResult;

  const invitationUrl = `${window.location.origin}/guest/${prep.dataJsonFileId}`;

  // 공유 URL 메타데이터가 비어 있으면 기본 문구로 보정한다.
  const normalizedShareUrl: ShareUrlState = {
    ...shareUrl,
    title: shareUrl.title?.trim() || DEFAULT_TITLE,
    description: shareUrl.description?.trim() || DEFAULT_DESCRIPTION,
    urlTitle: shareUrl.urlTitle?.trim() || DEFAULT_TITLE,
    urlDescription: shareUrl.urlDescription?.trim() || DEFAULT_DESCRIPTION,
  };

  // 에디터 상태 안에 남아 있는 File 객체를 Drive fileId로 치환한다.
  const replaceFiles = (obj: unknown): unknown => {
    if (obj instanceof File) {
      const fileId = fileToId.get(obj);
      if (!fileId) {
        console.warn('File not uploaded, skipping:', obj.name);
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

  const payload: InvitationPayload = {
    bulkData,
    blocks: newData,
    shareUrl: replacedShareUrl,
    bgm: finalBgm,
    mainPoster: finalMainPoster,
    invitationImage: images,
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
  try {
    const primaryImage =
      normalizedShareUrl.images?.[0] ?? normalizedShareUrl.urlImage?.[0];

    const imageFileId =
      typeof primaryImage === 'string'
        ? primaryImage
        : primaryImage instanceof File
          ? fileToId.get(primaryImage)
          : undefined;

    const shareRes = await fetch('/api/drive/shareUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationFolderId: prep.invitationFolderId,
        shareData: {
          title: normalizedShareUrl.title,
          description: normalizedShareUrl.description,
          imageFileId,
          showLocationButton: normalizedShareUrl.showLocationButton,
          showShareButton: normalizedShareUrl.showShareButton,
          invitationUrl,
          locationInfo: normalizedShareUrl.locationInfo,
        },
      }),
    });
    if (!shareRes.ok) {
      throw new Error(`shareUrl save failed: ${shareRes.status}`);
    }
  } catch (error) {
    console.error('Share data save failed:', error);
  }

  return {
    dataStep,
    thumbnailSaveFailed,
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

  let prep = await prepare(invitationUuid);
  let token = createTokenState(prep);
  let uploadResult = await upload({ prep, images, audio, token });
  let commitResult = await commit({
    prep,
    token,
    uploadResult,
    bulkData,
    images,
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
    prep = await prepareFallback(prep.invitationUuid);
    token = createTokenState(prep);
    uploadResult = await upload({ prep, images, audio, token });
    commitResult = await commit({
      prep,
      token,
      uploadResult,
      bulkData,
      images,
      data,
      shareUrl,
      bgmData,
      mainPoster,
      invitationThumbnail,
    });
  }

  setPreparedInvitation({
    ...prep,
    accessToken: token.currentToken,
    expiresAt: token.currentExpiresAt,
  });

  // 기존 반환 정책을 유지한다. 이미지/오디오/data/썸네일 중 실패가 있으면 success=false다.
  const totalFailed =
    uploadResult.imagesStep.final.fail.length +
    uploadResult.audioStep.final.fail.length +
    commitResult.dataStep.final.fail.length +
    (commitResult.thumbnailSaveFailed ? 1 : 0);

  return {
    success: totalFailed === 0,
    invitationUuid: prep.invitationUuid,
    results: {
      images: uploadResult.imagesStep.final,
      audio: uploadResult.audioStep.final,
      data: commitResult.dataStep.final,
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
  };
}
