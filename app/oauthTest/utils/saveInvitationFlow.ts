import {
  SerializedTextboxProps,
  SerializedImageProps,
  SerializedObjectProps,
} from 'fabric';

import { BulkData, EditorBlock } from '@/shared/types/block';

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
};

type InvitationPayload = {
  bulkData: BulkJson;
  blocks: EditorBlock[];
  bgm: BgmData;
  mainPoster: MainPosterData;
};

type BulkJson = {
  backgroundColor: string;
  isEngTitle: boolean;
  titleData: BulkData;
  bodyData: BulkData;
};

export async function saveInvitationFlow(params: {
  bulkData: BulkJson;
  images: UploadTask[];
  audio: File | null;
  data: EditorBlock[]; // useEditorStore의 데이터 타입.
  bgmData: BgmData;
  invitationUuid?: string; // 수정 진입이면 해당 파라미터가 존재함.
  mainPoster: MainPosterData;
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
  // 여기에 포스터 데이터 추가
  const { bulkData, images, audio, data, bgmData, invitationUuid, mainPoster } =
    params;

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

  const img = imagesStep.final.ok.reduce<Record<string, string[]>>(
    (acc, cur) => {
      if (!cur.id) return acc;
      acc[cur.id] ??= [];
      acc[cur.id].push(cur.fileId);
      return acc;
    },
    {}
  );

  const newData = data.map(item => {
    if (item.id in img) {
      return {
        ...item,
        props: {
          ...item.props,
          images: img[item.id],
        },
      };
    }
    return item;
  });

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

  // 여기에 포스터 데이터 추가
  const payload: InvitationPayload = {
    bulkData: bulkData,
    blocks: newData,
    bgm: finalBgm,
    mainPoster: mainPoster,
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

  const totalFailed =
    imagesStep.final.fail.length +
    audioStep.final.fail.length +
    dataStep.final.fail.length;

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
