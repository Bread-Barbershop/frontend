import { uploadFileToDrive } from "@/app/oauthTest/utils/uploadFileToDrive";

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
}): Promise<{ ok: UploadOk[]; fail: UploadFail[] }> {
  const { files, folderId, accessToken } = params;

  // 파일이 없으면 바로 끝
  if (files.length === 0) return { ok: [], fail: [] };

  const tasks = files.map(async (file) => {
    const result = await uploadFileToDrive(file, folderId, accessToken);
    return { file, ...result };
  });

  const settled = await Promise.allSettled(tasks);

  const ok: UploadOk[] = [];
  const fail: UploadFail[] = [];

  for (let i = 0; i < settled.length; i++) {
    const item = settled[i];
    const file = files[i]!;

    if (item.status === "fulfilled") {
      ok.push(item.value); // 성공하면 성공 배열에 push
    } else {
      fail.push({ file, error: item.reason }); // 실패하면 실패 배열에 push
    }
  }

  return { ok, fail }; // 성공, 실패 여부 반환.
}
