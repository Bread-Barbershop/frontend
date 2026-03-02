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

const DEFAULT_DATA_JSON_PAYLOAD = {
  blocks: [],
  bgm: {
    selectedBgmId: null,
    isLoop: false,
    volume: 0.2,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  },
};

// "invitation 폴더 내에 단일 data.json 초대 파일이 존재하는지 확인합니다. 파일이 없는 경우, 파일을 생성하고 유효한 기본 페이로드(payload)로 초기화합니다."
export async function ensureDataJsonFile(
  invitationFolderId: string
): Promise<EnsureDataJsonFileResult> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId is required', 400, {
      invitationFolderId,
    });
  }

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
    orderBy: 'createdTime',
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
      'data.json search failed',
      searchRes.status,
      searchData
    );
  }

  const found = searchData.files ?? [];
  if (found.length > 0) {
    return { dataJsonFileId: found[0].id, reused: true };
  }

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
    throw new DriveHttpError(
      'data.json create failed',
      createRes.status,
      created
    );
  }

  const initRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      created.id
    )}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(DEFAULT_DATA_JSON_PAYLOAD),
    }
  );

  if (!initRes.ok) {
    const initDetails = await initRes.json().catch(() => undefined);
    throw new DriveHttpError(
      'data.json default payload init failed',
      initRes.status,
      initDetails
    );
  }

  return { dataJsonFileId: created.id, reused: false };
}
