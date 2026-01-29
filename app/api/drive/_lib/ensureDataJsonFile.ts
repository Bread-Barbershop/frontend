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

export type EnsureDataJsonFileResult = {
  dataJsonFileId: string;
  reused: boolean;
};

const APP_IDENTIFIER = 'Bread-Barbershop';

const DATA_JSON_NAME = 'data.json';
const DATA_JSON_KIND = 'invitation_data_json';

/**
 * invitationFolderId 하위에 data.json 파일을 보장한다.
 * - 있으면 재사용
 * - 없으면 생성
 *
 * 주의:
 * - Drive는 같은 이름 파일이 여러 개 있을 수 있어 appProperties.kind로 식별한다.
 * - 그래도 혹시 중복이 생기면 createdTime 오래된 것을 정본으로 취급한다(폴더 정책과 동일).
 */
export async function ensureDataJsonFile(
  invitationFolderId: string
): Promise<EnsureDataJsonFileResult> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId가 필요합니다.', 400, {
      invitationFolderId,
    });
  }

  // 1) appProperties.kind 기반으로 검색 (이름은 보조 조건)
  const q = [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='${DATA_JSON_KIND}' }`,
    `name='${escapeDriveQueryValue(DATA_JSON_NAME)}'`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime,appProperties)',
    orderBy: 'createdTime', // 가장 오래된 것을 정본으로 정함(중복 방어)
    pageSize: '10',
  });

  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
  );

  const searchData = (await searchRes.json().catch(() => ({}))) as {
    files?: DriveFile[];
    error?: unknown;
  };

  if (!searchRes.ok) {
    throw new DriveHttpError(
      'data.json 검색 실패',
      searchRes.status,
      searchData
    );
  }

  const found = searchData.files ?? [];
  if (found.length > 0) {
    return { dataJsonFileId: found[0].id, reused: true };
  }

  // 2) 없으면 생성 (빈 JSON으로 시작)
  const createRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: DATA_JSON_NAME,
        mimeType: 'application/json',
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: DATA_JSON_KIND,
        },
      }),
    }
  );

  const created = (await createRes.json().catch(() => ({}))) as {
    id?: string;
    error?: unknown;
  };

  if (!createRes.ok || !created.id) {
    throw new DriveHttpError('data.json 생성 실패', createRes.status, created);
  }

  return { dataJsonFileId: created.id, reused: false };
}
