import type { UploadTask } from '@/shared/types/invitationSave';

import { uploadFileToDrive } from './uploadFileToDrive';
export type UploadOk = {
  file: File;
  fileId: string;
  name: string;
  id?: string;
};

export type UploadFail = {
  file: UploadTask | File;
  error: unknown;
};
export async function uploadAllSettled(params: {
  originFile: (UploadTask | File)[];
  folderId: string;
  accessToken: string;
  concurrency?: number;
}): Promise<{ ok: UploadOk[]; fail: UploadFail[] }> {
  const { originFile, folderId, accessToken, concurrency = originFile.length } = params;
  const workerCount = Math.min(originFile.length, Math.max(1, concurrency || 1));
  const pending = originFile.entries();
  const results: (UploadOk | UploadFail)[] = [];

  async function uploadPendingFiles() {
    for (const [index, item] of pending) {
      const { file, id } = 'file' in item ? item : { file: item, id: undefined };
      try {
        const result = await uploadFileToDrive(file, folderId, accessToken);
        results[index] = { id, file, ...result };
      } catch (error) {
        results[index] = { file: item, error };
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, uploadPendingFiles));
  return {
    ok: results.filter(result => !('error' in result)),
    fail: results.filter(result => 'error' in result),
  };
}
