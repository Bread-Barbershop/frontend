import { uploadFileToDrive } from '@/app/oauthTest/utils/uploadFileToDrive';

export type UploadOk = {
  file: File;
  fileId: string;
  name: string;
};

export type UploadFail = {
  file: File;
  error: unknown;
};

export async function uploadAllSettled(params: {
  files: File[];
  folderId: string;
  accessToken: string;
  concurrency?: number; // 동시 업로드 개수 옵션. 호출할 때 지정하면서 테스트.
}): Promise<{ ok: UploadOk[]; fail: UploadFail[] }> {
  const { files, folderId, accessToken, concurrency } = params;

  // 파일이 없으면 바로 끝
  if (files.length === 0) return { ok: [], fail: [] };

  const limit = Math.max(1, concurrency ?? files.length);

  const ok: UploadOk[] = [];
  const fail: UploadFail[] = [];

  for (let i = 0; i < files.length; i += limit) {
    const chunk = files.slice(i, i + limit);

    const tasks = chunk.map(async file => {
      const result = await uploadFileToDrive(file, folderId, accessToken);
      return { file, ...result };
    });

    const settled = await Promise.allSettled(tasks);

    for (let j = 0; j < settled.length; j++) {
      const item = settled[j];
      const file = chunk[j]!;

      if (item.status === 'fulfilled') {
        ok.push(item.value); // 성공하면 성공 배열에 push
      } else {
        fail.push({ file, error: item.reason }); // 실패하면 실패 배열에 push
      }
    }
  }

  return { ok, fail }; // 성공, 실패 여부 반환.
}
