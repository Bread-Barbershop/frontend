import { uploadFileToDrive } from './uploadFileToDrive';

import type { UploadFail, UploadOk } from './uploadAllSettled';

function retryable(error: unknown) {
  const status =
    (error as { status?: number })?.status ??
    Number((error as Error)?.message?.match(/:\\s*(\\d{3})/)?.[1]);
  return !status || status === 409 || status === 429 || status >= 500;
}

export async function retryFailedOnce(params: {
  failures: UploadFail[];
  folderId: string;
}): Promise<{ ok: UploadOk[]; fail: UploadFail[] }> {
  const ok: UploadOk[] = [];
  const fail: UploadFail[] = [];
  for (const failure of params.failures) {
    if (!retryable(failure.error)) {
      fail.push(failure);
      continue;
    }
    try {
      const file =
        failure.file instanceof File ? failure.file : failure.file.file;
      const result = await uploadFileToDrive(file, params.folderId);
      ok.push({ file, ...result });
    } catch (error) {
      fail.push({ file: failure.file, error });
    }
  }
  return { ok, fail };
}
