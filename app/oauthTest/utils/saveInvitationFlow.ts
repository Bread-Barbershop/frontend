import { EditorBlock } from '@/widgets/editor/store/useEditorStore';

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

type ImageTask = {
  id: string;
  file: File;
};

export async function saveInvitationFlow(params: {
  images: ImageTask[];
  audio: File | null;
  // data: object | File; // 객체든, 이미 File로 만들어진 data.json이든 둘 다 허용. 편집데이터 JSON임.
  data: EditorBlock[]; // 객체든, 이미 File로 만들어진 data.json이든 둘 다 허용. 편집데이터 JSON임.
  invitationUuid?: string; // 수정 진입이면 해당 파라미터가 존재함.
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
  const { images, audio, data, invitationUuid } = params;

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
    files: File[];
    folderId: string;
    concurrency?: number; // 1회 업로드시 파일 개수 제한 옵션.
    originFile?: ImageTask[];
  }): Promise<{ final: BatchResult; usedAccessToken: string }> => {
    if (step.files.length === 0) {
      return { final: { ok: [], fail: [] }, usedAccessToken: currentToken };
    }

    const firstAttempt = await uploadAllSettled({
      files: step.files,
      originFile: step.originFile ?? [],
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
    files: images.map(item => item.file),
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
  // 입력 data를 Drive에 저장할 "data.json 파일"로 만든다.
  // - data가 object면: File로 포장해서 업로드
  // - data가 File이면(이미 만들어둔 data.json이면): 그대로 사용
  const dataFile: File =
    data instanceof File
      ? data
      : new File([JSON.stringify(newData)], 'data.json', {
          type: 'application/json',
        });

  // 3) 오디오 업로드(있으면)
  const audioStep = await runUploadStep({
    files: audio ? [audio] : [],
    folderId: prep.audioFolderId,
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
