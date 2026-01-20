import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/oauthTest/utils/googleFetch';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
};

export type EnsureInvitationFolderResult = {
  invitationFolderId: string;
  reused: boolean;
};

// 나중에 이것도 초대장 네임으로 받아야 함.
const INVITATION_FOLDER_NAME = '초대장';
const APP_IDENTIFIER = 'Bread-Barbershop';

/**
 * workspaceFolderId 하위에 "초대장" 폴더를 보장한다.
 * - 있으면 재사용(reused: true)
 * - 없으면 생성(reused: false)
 */
export async function ensureInvitationFolder(
  workspaceFolderId: string
): Promise<EnsureInvitationFolderResult> {
  if (!workspaceFolderId) {
    throw new DriveHttpError('workspaceFolderId가 필요합니다.', 400, {
      workspaceFolderId,
    });
  }

  // NOTE:
  // - 부모 폴더 하위(in parents)로 범위를 좁히고
  // - name, mimeType, trashed, appProperties(app_id, kind)로 정확도를 높인다
  const q = [
    `'${escapeDriveQueryValue(workspaceFolderId)}' in parents`,
    `name='${escapeDriveQueryValue(INVITATION_FOLDER_NAME)}'`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='invitation_root' }`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime)',
    orderBy: 'createdTime',
    pageSize: '1',
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
      '초대장 폴더 검색 실패',
      searchRes.status,
      searchData
    );
  }

  const existing = searchData.files?.[0];
  if (existing?.id) {
    return { invitationFolderId: existing.id, reused: true };
  }

  // 없으면 생성
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
          kind: 'invitation_root',
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
      '초대장 폴더 생성 실패',
      createRes.status,
      created
    );
  }

  return { invitationFolderId: created.id, reused: false };
}

/**
 * Drive query 문자열에서 작은따옴표(') 때문에 깨지는 걸 방지하기 위한 최소 이스케이프
 */
function escapeDriveQueryValue(value: string): string {
  return value.replace(/'/g, "\\'");
}
