import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

export const APP_IDENTIFIER = 'Bread-Barbershop';
export const THUMBNAIL_NAME_WEBP = 'invitation-thumbnail.webp';
export const THUMBNAIL_NAME_PNG = 'invitation-thumbnail.png';
export const THUMBNAIL_NAME = THUMBNAIL_NAME_WEBP;
export const THUMBNAIL_KIND = 'invitation_thumbnail_png';

export type ThumbnailPayload = {
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
};

export type EnsureThumbnailFileResult = {
  thumbnailFileId: string | null;
  reused: boolean;
};

/**
 * invitation 폴더 내에 단일 썸네일(WebP 또는 기존 PNG) 파일이 존재하는지 확인합니다.
 */
export async function ensureThumbnailFile(
  invitationFolderId: string
): Promise<EnsureThumbnailFileResult> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId is required', 400, {
      invitationFolderId,
    });
  }

  // 1) 기존 파일 검색 (신규 webp 및 레거시 png 모두 검색)
  const q = [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(APP_IDENTIFIER)}' }`,
    `appProperties has { key='kind' and value='${THUMBNAIL_KIND}' }`,
    `(name='${escapeDriveQueryValue(THUMBNAIL_NAME_WEBP)}' or name='${escapeDriveQueryValue(THUMBNAIL_NAME_PNG)}')`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime,appProperties)',
    // 정리 실패로 PNG/WebP 파일이 함께 남아도 최신 썸네일을 선택한다.
    orderBy: 'createdTime desc',
    pageSize: '10',
  });

  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
  );

  const searchData = (await searchRes.json().catch(() => ({}))) as {
    files?: Array<{ id: string }>;
    error?: unknown;
  };

  if (!searchRes.ok) {
    throw new DriveHttpError(
      'invitation-thumbnail search failed',
      searchRes.status,
      searchData
    );
  }

  const found = searchData.files ?? [];
  if (found.length > 0) {
    return { thumbnailFileId: found[0].id, reused: true };
  }

  // 2) 파일이 없는 경우 null 반환
  return { thumbnailFileId: null, reused: false };
}
