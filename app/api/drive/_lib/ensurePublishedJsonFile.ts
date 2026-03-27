import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
  appProperties?: Record<string, string>;
};

const APP_IDENTIFIER = 'Bread-Barbershop';
const PUBLISHED_JSON_NAME = 'published.json';
const PUBLISHED_JSON_KIND = 'invitation_published_json';

/**
 * invitation 폴더 내에 published.json 파일을 생성하거나 업데이트합니다.
 * 이 파일은 발행된 초대장의 guestUrl 정보를 담고 있습니다.
 */
export async function ensurePublishedJsonFile(
  invitationFolderId: string,
  guestUrl: string
): Promise<{ fileId: string }> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId is required', 400, {
      invitationFolderId,
    });
  }

  const payload = { guestUrl };

  // 1. 기존 published.json 검색
  const q = [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='${PUBLISHED_JSON_KIND}' }`,
    `name='${escapeDriveQueryValue(PUBLISHED_JSON_NAME)}'`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id)',
  });

  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
  );

  const searchData = (await searchRes.json().catch(() => ({}))) as {
    files?: DriveFile[];
  };

  if (!searchRes.ok) {
    throw new DriveHttpError(
      'published.json search failed',
      searchRes.status,
      searchData
    );
  }

  let fileId = searchData.files?.[0]?.id;

  // 2. 파일이 없으면 생성
  if (!fileId) {
    const createRes = await googleFetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: PUBLISHED_JSON_NAME,
          mimeType: 'application/json',
          parents: [invitationFolderId],
          appProperties: {
            app_id: APP_IDENTIFIER,
            kind: PUBLISHED_JSON_KIND,
          },
        }),
      }
    );

    const created = (await createRes.json().catch(() => ({}))) as {
      id?: string;
    };

    if (!createRes.ok || !created.id) {
      throw new DriveHttpError(
        'published.json create failed',
        createRes.status,
        created
      );
    }
    fileId = created.id;
  }

  // 3. 내용 업데이트 (PATCH upload media)
  const updateRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      fileId
    )}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload),
    }
  );

  if (!updateRes.ok) {
    const updateData = await updateRes.json().catch(() => ({}));
    throw new DriveHttpError(
      'published.json update failed',
      updateRes.status,
      updateData
    );
  }

  return { fileId };
}
