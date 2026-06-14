import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { escapeDriveQueryValue } from '@/app/api/drive/_lib/escapeQueryValue';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
};

const WORKSPACE_NAME = '모바일 초대장 invia';
const LEGACY_WORKSPACE_NAME = '나의 모바일 청첩장';
const APP_IDENTIFIER = 'Bread-Barbershop';

async function findWorkspaceFolderIdByName(
  name: string
): Promise<string | null> {
  const q = [
    `name='${escapeDriveQueryValue(name)}'`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime)',
    orderBy: 'createdTime',
    pageSize: '1',
  });

  const res = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    { cache: 'no-store' }
  );

  const data = (await res.json().catch(() => ({}))) as {
    files?: DriveFile[];
    error?: unknown;
  };

  if (!res.ok) {
    throw new DriveHttpError('워크스페이스 검색 실패', res.status, data);
  }

  return data.files?.[0]?.id ?? null;
}

/**
 * 워크스페이스 "존재 확인" 전용
 * - 있으면 folderId 반환
 * - 없으면 null 반환
 * - 생성은 절대 하지 않음
 */
export async function findWorkspaceFolderId(): Promise<string | null> {
  return (
    (await findWorkspaceFolderIdByName(WORKSPACE_NAME)) ??
    (await findWorkspaceFolderIdByName(LEGACY_WORKSPACE_NAME))
  );
}
