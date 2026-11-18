import 'server-only';

import { sanitizeInvitationHtml } from '@/shared/utils/sanitizeInvitationHtml';

import { assertManagedFileAccess } from './driveAccess';
import { DriveHttpError } from './ensureWorkspace';
import { googleFetch } from './googleFetch';
import { markSaveStage } from './saveJournal';

export const MAX_INVITATION_JSON_BYTES = 32 * 1024 * 1024;

export async function assertDataJsonAccess(
  fileId: string,
  expectedInvitationId?: string
) {
  const result = await assertManagedFileAccess(fileId, expectedInvitationId);
  if (
    result.file.appProperties?.app_id !== 'Bread-Barbershop' ||
    result.file.appProperties.kind !== 'invitation_data_json' ||
    result.file.mimeType !== 'application/json'
  ) {
    throw new DriveHttpError(
      '초대장 데이터 파일만 저장할 수 있습니다.',
      403,
      {}
    );
  }
  return result;
}

export async function commitInvitationData(
  fileId: string,
  payload: unknown,
  expectedInvitationId?: string
) {
  const { file, invitation } = await assertDataJsonAccess(
    fileId,
    expectedInvitationId
  );
  const value = payload as Record<string, unknown> | null;
  if (
    !value ||
    !Array.isArray(value.blocks) ||
    !value.bulkData ||
    !value.mainPoster
  )
    throw new DriveHttpError(
      '초대장 데이터 형식이 올바르지 않습니다.',
      400,
      {}
    );
  const response = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizeInvitationHtml(payload)),
    }
  );
  if (!response.ok)
    throw new DriveHttpError(
      '초대장 저장에 실패했습니다.',
      response.status,
      {}
    );
  await markSaveStage(invitation.appProperties!.inv_id, 'data_saved');
  return { fileId, name: file.name };
}

export async function readUploadedJson(response: Response) {
  if (!response.ok || !response.body)
    throw new DriveHttpError('임시 초대장 파일을 읽지 못했습니다.', 502, {});
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_INVITATION_JSON_BYTES) {
      await reader.cancel();
      throw new DriveHttpError('초대장 데이터가 너무 큽니다.', 413, {});
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new DriveHttpError('초대장 JSON 형식이 올바르지 않습니다.', 400, {});
  }
}
