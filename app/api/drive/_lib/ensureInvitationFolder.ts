import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';
import { generateUuid } from './generateUuid';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
  appProperties?: Record<string, string>;
};

export type EnsureInvitationFolderResult = {
  invitationFolderId: string;
  invitationUuid: string;
  reused: boolean;
};

const INVITATION_FOLDER_NAME = '초대장'; // 추후 초대장 이름은 유저로부터 받을것.
const APP_IDENTIFIER = 'Bread-Barbershop';
const INVITATION_KIND = 'invitation';

/**
 * 초대장 폴더를 uuid 기준으로 보장한다.
 *
 * - invitationUuid가 있으면: 해당 uuid 폴더 검색 → 있으면 재사용
 * - invitationUuid가 없거나 못 찾으면: 새로 생성
 */
export async function ensureInvitationFolder(params: {
  workspaceFolderId: string;
  invitationUuid?: string;
}): Promise<EnsureInvitationFolderResult> {
  const { workspaceFolderId } = params;

  if (!workspaceFolderId) {
    throw new DriveHttpError('workspaceFolderId가 필요합니다.', 400, {
      workspaceFolderId,
    });
  }

  const invitationUuid = params.invitationUuid ?? generateUuid();

  // 1) uuid 기반 검색 (이름은 조건에 넣지 않음)
  const q = [
    `'${escapeDriveQueryValue(workspaceFolderId)}' in parents`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='${INVITATION_KIND}' }`,
    `appProperties has { key='inv_id' and value='${escapeDriveQueryValue(
      invitationUuid
    )}' }`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime,appProperties)',
    orderBy: 'createdTime', // 가장 오래된 것을 정본으로 정함.
    pageSize: '10',         // 중복 방어
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
      '초대장 폴더(uuid) 검색 실패',
      searchRes.status,
      searchData
    );
  }

  const found = searchData.files ?? [];
  if (found.length > 0) {
    return {
      invitationFolderId: found[0].id,
      invitationUuid,
      reused: true,
    };
  }

  // 2) 없으면 생성
  const createRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: INVITATION_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [workspaceFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: INVITATION_KIND,
          inv_id: invitationUuid,
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
      '초대장 폴더(uuid) 생성 실패',
      createRes.status,
      created
    );
  }

  return {
    invitationFolderId: created.id,
    invitationUuid,
    reused: false,
  };
}