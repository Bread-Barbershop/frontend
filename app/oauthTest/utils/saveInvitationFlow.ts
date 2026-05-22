import {
  SerializedTextboxProps,
  SerializedImageProps,
  SerializedObjectProps,
} from 'fabric';

import { BulkData, PersistedEditorBlock } from '@/shared/types/block';
import type { ShareUrlState } from '@/shared/types/block';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/shared/utils/shareUrlDefaults';

import { retryFailedOnce } from './retryFailedOnce';
import { retryPatchFailedOnce } from './retryPatchFailedOnce';
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

type UploadTask = {
  id: string;
  file: File;
};

export type BgmData = {
  selectedBgmId: string | null;
  isLoop: boolean;
  volume: number;
  userBgmTitle: string | null;
  userBgmDuration: string | null;
  userBgmFileId: string | null;
};

export type MainPosterData = {
  version: string;
  objects: (
    | SerializedTextboxProps
    | SerializedImageProps
    | SerializedObjectProps
  )[];
  background?: string;
  thumbnailFileId?: string;
};

type InvitationPayload = {
  bulkData: BulkJson;
  blocks: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  bgm: BgmData;
  mainPoster: MainPosterData;
  invitationImage: UploadTask[];
};

type BulkJson = {
  backgroundColor: string;
  titleData: BulkData;
  bodyData: BulkData;
  isZoom: boolean;
};

type InvitationThumbnail = {
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
};

export async function saveInvitationFlow(params: {
  bulkData: BulkJson;
  images: UploadTask[];
  audio: File | null;
  data: PersistedEditorBlock[]; // 블록 데이터(shareUrl 제외)
  shareUrl: ShareUrlState;
  bgmData: BgmData;
  invitationUuid?: string; // 수정 진입이면 해당 파라미터가 존재함.
  mainPoster: MainPosterData;
  invitationThumbnail: InvitationThumbnail;
}): Promise<{
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
}> {
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

  // 1) 서버에서 폴더 구조 + fresh 토큰 받기
  const prepRes = await fetch('/api/drive/saveInvitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationUuid }),
  });

  if (!prepRes.ok) {
    throw new Error(`saveInvitation prepare failed: ${prepRes.status}`);
  }

  const prep = (await prepRes.json()) as SaveInvitationPrepareResponse;

  let currentToken = prep.accessToken;
  let refreshedToken = false;

  // 401일 때만 호출될 “토큰 재발급 함수”
  const refreshAccessToken = async () => {
    const r = await fetch('/api/drive/getToken', { method: 'POST' });
    if (!r.ok) throw new Error(`refresh-token failed: ${r.status}`);
    const j = await r.json();

    currentToken = j.accessToken as string;
    refreshedToken = true;

    return currentToken;
  };

  // 공통 실행 패턴: 1차 업로드 → 실패만 1회 재시도
  const runUploadStep = async (step: {
    folderId: string;
    originFile: UploadTask[];
    concurrency?: number; // 1회 업로드시 파일 개수 제한 옵션.
  }): Promise<{ final: BatchResult; usedAccessToken: string }> => {
    if (step.originFile.length === 0) {
      return { final: { ok: [], fail: [] }, usedAccessToken: currentToken };
    }

    const firstAttempt = await uploadAllSettled({
      originFile: step.originFile,
      folderId: step.folderId,
      accessToken: currentToken,
      concurrency: step.concurrency,
    });

    const retryAttempt = firstAttempt.fail.length
      ? await retryFailedOnce({
          failures: firstAttempt.fail,
          folderId: step.folderId,
          accessToken: currentToken,
          refreshAccessToken,
        })
      : {
          ok: [],
          fail: [],
          refreshedToken: false,
          usedAccessToken: currentToken,
        };

    // retry에서 새 토큰을 썼으면 이후 단계도 그 토큰으로 간다
    if (retryAttempt.refreshedToken) {
      currentToken = retryAttempt.usedAccessToken;
    }

    return {
      final: {
        ok: [...firstAttempt.ok, ...retryAttempt.ok],
        fail: retryAttempt.fail,
      },
      usedAccessToken: currentToken,
    };
  };

  // 2) 이미지 업로드
  const imagesStep = await runUploadStep({
    originFile: images,
    folderId: prep.imageFolderId,
    concurrency: 5, // 이미지는 5장씩만 끊어서 전송.
  });

  // 매핑용 Map: File 객체 참조 -> 업로드된 fileId
  const fileToId = new Map<File, string>();
  imagesStep.final.ok.forEach(ok => {
    fileToId.set(ok.file, ok.fileId);
  });

  const invitationUrl = `${window.location.origin}/guest/${prep.dataJsonFileId}`;

  const normalizedShareUrl: ShareUrlState = {
    ...shareUrl,
    title: shareUrl.title?.trim() || DEFAULT_TITLE,
    description: shareUrl.description?.trim() || DEFAULT_DESCRIPTION,
    urlTitle: shareUrl.urlTitle?.trim() || DEFAULT_TITLE,
    urlDescription: shareUrl.urlDescription?.trim() || DEFAULT_DESCRIPTION,
  };

  const replaceFiles = (obj: unknown): unknown => {
    if (obj instanceof File) {
      const fileId = fileToId.get(obj); // 기존 변수명 fileToId 사용
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

  const newData = data.map(item => ({
    ...item,
    props: replaceFiles(item.props) as typeof item.props,
  }));

  // 3) 오디오 업로드(있으면)
  const audioStep = await runUploadStep({
    originFile: audio ? [{ id: 'bgm', file: audio }] : [],
    folderId: prep.audioFolderId,
  });

  const uploadedAudioFileId = audioStep.final.ok[0]?.fileId ?? null;
  const isUserBgmSelected = bgmData.selectedBgmId === 'user-bgm';

  const finalBgm: BgmData = {
    ...bgmData,
    userBgmFileId: isUserBgmSelected
      ? (uploadedAudioFileId ?? bgmData.userBgmFileId ?? null)
      : null,
  };

  let thumbnailFileId: string | undefined = undefined;
  let thumbnailSaveFailed = false;

  // 3.5) 초대장 썸네일 데이터 먼저 저장하여 URL 확보
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
      thumbnailFileId = thumbnailResult.thumbnailFileId;
    } catch (error) {
      thumbnailSaveFailed = true;
      console.error('초대장 썸네일 데이터 저장 실패:', error);
    }
  }

  const finalMainPoster: MainPosterData = {
    ...mainPoster,
    thumbnailFileId,
  };

  const payload: InvitationPayload = {
    bulkData: bulkData,
    blocks: newData,
    shareUrl: replacedShareUrl,
    bgm: finalBgm,
    mainPoster: finalMainPoster,
    invitationImage: images,
  };

  // 편집 데이터가 기록될 json 파일 생성.
  const dataFile = new File([JSON.stringify(payload)], 'data.json', {
    type: 'application/json',
  });

  // 4) data.json PATCH 전용 재시도
  const dataFirstAttempt: BatchResult = await (async () => {
    try {
      const result = await updateFileToDrive(
        dataFile,
        prep.dataJsonFileId,
        currentToken
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
    fileId: prep.dataJsonFileId, // PATCH 대상 fileId
    accessToken: currentToken,
    refreshAccessToken,
  });

  // retry에서 새 토큰을 썼으면 이후 단계도 그 토큰으로 간다
  if (dataRetryAttempt.refreshedToken) {
    currentToken = dataRetryAttempt.usedAccessToken;
  }

  const dataStep: { final: BatchResult; usedAccessToken: string } = {
    final: {
      ok: [...dataFirstAttempt.ok, ...dataRetryAttempt.ok],
      fail: dataRetryAttempt.fail,
    },
    usedAccessToken: currentToken,
  };

  // 5) 공유 데이터 저장 (최상위 shareUrl store 기준)
  try {
    const primaryImage =
      normalizedShareUrl.images?.[0] ?? normalizedShareUrl.urlImage?.[0];

    const imageFileId =
      typeof primaryImage === 'string'
        ? primaryImage
        : primaryImage instanceof File
          ? fileToId.get(primaryImage)
          : undefined;

    await fetch('/api/drive/shareUrl', {
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
  } catch (error) {
    // 공유 데이터 저장 실패는 전체 저장 실패로 간주하지 않음
    console.error('공유 데이터 저장 실패:', error);
  }



  const totalFailed =
    imagesStep.final.fail.length +
    audioStep.final.fail.length +
    dataStep.final.fail.length +
    (thumbnailSaveFailed ? 1 : 0);

  return {
    success: totalFailed === 0,
    invitationUuid: prep.invitationUuid,
    results: {
      images: imagesStep.final,
      audio: audioStep.final,
      data: dataStep.final,
    },
    folders: {
      workspaceFolderId: prep.workspaceFolderId,
      invitationFolderId: prep.invitationFolderId,
      imageFolderId: prep.imageFolderId,
      audioFolderId: prep.audioFolderId,
    },
    debug: {
      refreshedToken,
      usedAccessToken: currentToken,
    },
  };
}
