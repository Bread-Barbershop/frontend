import { updateFileToDrive } from '@/app/oauthTest/utils/updateFileToDrive';

import type { UploadFail, UploadOk } from './uploadAllSettled';

// error에서 HTTP status(401, 500 등)를 뽑아내는 함수
function getStatus(err: unknown): number | null {
  if (err instanceof Error) {
    // PATCH용 에러 메시지 형식. (아래 콘솔 로그 형식이 아닐 수 있음.)
    const m = err.message.match(/Drive update failed:\s*(\d{3})/);
    if (m?.[1]) return Number(m[1]);

    // 기존 upload 에러 메시지도 같이 커버 (재사용성)
    const m2 = err.message.match(/Drive upload failed:\s*(\d{3})/);
    if (m2?.[1]) return Number(m2[1]);
  }
  // 다른 형태(라이브러리/원인 객체)의 에러 탐색.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  const code = anyErr?.cause?.error?.code ?? anyErr?.status ?? anyErr?.code;
  if (typeof code === 'number') return code;
  if (typeof code === 'string' && /^\d{3}$/.test(code)) return Number(code);
  return null;
}

function is401(err: unknown) {
  return getStatus(err) === 401;
}

function is5xx(err: unknown) {
  const s = getStatus(err);
  return s !== null && s >= 500 && s <= 599;
}

export async function retryPatchFailedOnce(params: {
  failures: UploadFail[];
  fileId: string; // PATCH 대상 fileId (dataJsonFileId)
  accessToken: string;
  refreshAccessToken: () => Promise<string>;
}): Promise<{
  ok: UploadOk[];
  fail: UploadFail[];
  refreshedToken: boolean;
  usedAccessToken: string;
}> {
  const { failures, fileId, accessToken, refreshAccessToken } = params;

  // 실패가 없으면 바로 끝
  if (failures.length === 0) {
    return {
      ok: [],
      fail: [],
      refreshedToken: false,
      usedAccessToken: accessToken,
    };
  }

  // 1 재시도할 가치가 있는 실패만 고르기 (401 또는 5xx)
  const retryTargets = failures.filter(f => is401(f.error) || is5xx(f.error));

  // 재시도 대상이 없으면 그대로 반환
  if (retryTargets.length === 0) {
    return {
      ok: [],
      fail: failures,
      refreshedToken: false,
      usedAccessToken: accessToken,
    };
  }

  // 2 401이 하나라도 있으면 토큰을 딱 1번만 갱신
  const needRefresh = retryTargets.some(f => is401(f.error));
  const usedAccessToken = needRefresh
    ? await refreshAccessToken()
    : accessToken;

  // 3 재시도 실행 (PATCH)
  const tasks = retryTargets.map(async ({ file }) => {
    const { fileId: updatedFileId, name } = await updateFileToDrive(
      file,
      fileId,
      usedAccessToken
    );
    // update 결과의 id는 보통 입력 fileId와 동일하지만, 응답을 신뢰해서 넣어줌
    return { file, fileId: updatedFileId, name } satisfies UploadOk;
  });

  const settled = await Promise.allSettled(tasks);

  // 4 결과 정리
  const ok: UploadOk[] = [];
  const retriedFail: UploadFail[] = [];

  for (let i = 0; i < settled.length; i++) {
    const item = settled[i];
    const file = retryTargets[i]!.file;

    if (item.status === 'fulfilled') ok.push(item.value);
    else retriedFail.push({ file, error: item.reason });
  }

  // 5 처음부터 재시도 대상이 아니었던 실패는 그대로 유지
  const nonRetryFails = failures.filter(
    f => !retryTargets.some(t => t.file === f.file)
  );

  return {
    ok,
    fail: [...nonRetryFails, ...retriedFail],
    refreshedToken: needRefresh,
    usedAccessToken,
  };
}
