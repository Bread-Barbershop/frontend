import 'server-only';

import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
};

export type EnsureWorkspaceResult = {
  folderId: string;
  reused: boolean; // true면 기존 폴더 재사용, false면 새로 생성
};

const WORKSPACE_NAME = '나의 모바일 청첩장';
const APP_IDENTIFIER = 'Bread-Barbershop';

/**
 * Google Drive에서 우리 서비스의 워크스페이스 폴더를 "보장"한다.
 * - 있으면 재사용(reused: true)
 * - 없으면 생성(reused: false)
 *
 * 실패 시 Error를 throw하며, status는 상위(라우트핸들러)에서 해석한다.
 */
export async function ensureWorkspace(): Promise<EnsureWorkspaceResult> {
  // 검색 쿼리 구성
  const q = [
    `name='${escapeDriveQueryValue(WORKSPACE_NAME)}'`,
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

  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
  );
  const searchData = (await searchRes.json().catch(() => ({}))) as {
    files?: DriveFile[];
    error?: unknown;
  };

  if (!searchRes.ok) {
    // 라우트에서 status를 결정할 수 있게 정보를 포함해 던짐
    throw new DriveHttpError(
      '워크스페이스 검색 실패',
      searchRes.status,
      searchData
    );
  }

  const existing = searchData.files?.[0];
  if (existing?.id) {
    return { folderId: existing.id, reused: true };
  }

  // 없으면 생성
  const createRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: WORKSPACE_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        appProperties: { app_id: APP_IDENTIFIER },
      }),
    }
  );

  const created = (await createRes.json().catch(() => ({}))) as {
    id?: string;
    error?: unknown;
  };

  if (!createRes.ok || !created.id) {
    throw new DriveHttpError(
      '워크스페이스 생성 실패',
      createRes.status,
      created
    );
  }

  return { folderId: created.id, reused: false };
}

/**
 * Drive API 호출 실패 시 status + details를 라우트로 올리기 위한 커스텀 에러
 */
export class DriveHttpError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'DriveHttpError';
    this.status = status;
    this.details = details;
  }
}
