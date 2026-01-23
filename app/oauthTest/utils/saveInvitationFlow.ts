// lib/upload/saveInvitationFlow.ts
import { retryFailedOnce } from './retryFailedOnce';
import {
  uploadAllSettled,
  type UploadFail,
  type UploadOk,
} from './uploadAllSettled';

type SaveInvitationPrepareResponse = {
  workspaceFolderId: string;
  invitationFolderId: string;
  invitationUuid: string;
  imageFolderId: string;
  audioFolderId: string;
  accessToken: string;
  expiresAt: string | number;
  meta?: unknown;
};

type BatchResult = { ok: UploadOk[]; fail: UploadFail[] };

export async function saveInvitationFlow(params: {
  images: File[];
  audio: File | null;
  data: object | File; // 객체든, 이미 File로 만들어진 data.json이든 둘 다 허용. 편집데이터 JSON임.
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

  // 입력 data를 Drive에 저장할 "data.json 파일"로 만든다.
  // - data가 object면: File로 포장해서 업로드
  // - data가 File이면(이미 만들어둔 data.json이면): 그대로 사용
  const dataFile: File =
    data instanceof File
      ? data
      : new File([JSON.stringify(data)], 'data.json', {
          type: 'application/json',
        });

  // 공통 실행 패턴: 1차 업로드 → 실패만 1회 재시도
  const runUploadStep = async (step: {
    files: File[];
    folderId: string;
  }): Promise<{ final: BatchResult; usedAccessToken: string }> => {
    if (step.files.length === 0) {
      return { final: { ok: [], fail: [] }, usedAccessToken: currentToken };
    }

    const r1 = await uploadAllSettled({
      files: step.files,
      folderId: step.folderId,
      accessToken: currentToken,
    });

    const r2 = await retryFailedOnce({
      failures: r1.fail,
      folderId: step.folderId,
      accessToken: currentToken,
      refreshAccessToken,
    });

    // retry에서 새 토큰을 썼으면 이후 단계도 그 토큰으로 간다
    if (r2.refreshedToken) {
      currentToken = r2.usedAccessToken;
    }

    return {
      final: { ok: [...r1.ok, ...r2.ok], fail: r2.fail },
      usedAccessToken: currentToken,
    };
  };

  // 2) 이미지 업로드
  const imagesStep = await runUploadStep({
    files: images,
    folderId: prep.imageFolderId,
  });

  // 3) 오디오 업로드(있으면)
  const audioStep = await runUploadStep({
    files: audio ? [audio] : [],
    folderId: prep.audioFolderId,
  });

  // 4) data.json 업로드(마지막)
  const dataStep = await runUploadStep({
    files: [dataFile],
    folderId: prep.invitationFolderId,
  });

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
