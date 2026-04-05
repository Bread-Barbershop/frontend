import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

export const APP_IDENTIFIER = 'Bread-Barbershop';
export const SHARE_URL_NAME = 'kakao-share.json';
export const SHARE_URL_KIND = 'kakao_share_json';

export type ShareUrlPayload = {
  title: string;
  description: string;
  imageFileId?: string;
  showLocationButton: boolean;
  showShareButton: boolean;
  invitationUrl?: string;
  locationInfo?: {
    lat: number;
    lng: number;
    placeName: string;
  };
};

export type EnsureShareUrlFileResult = {
  shareUrlFileId: string | null;
  reused: boolean;
};

/**
 * invitation 폴더 내에 단일 kakao-share.json 파일이 존재하는지 확인합니다.
 * 파일이 없는 경우, 파일을 생성하고 기본 페이로드로 초기화합니다.
 *
 * 기존 ensureDataJsonFile 패턴과 동일한 방식으로 동작합니다.
 */
export async function ensureShareUrlFile(
  invitationFolderId: string
): Promise<EnsureShareUrlFileResult> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId is required', 400, {
      invitationFolderId,
    });
  }

  // 1) 기존 파일 검색
  const q = [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(APP_IDENTIFIER)}' }`,
    `appProperties has { key='kind' and value='${SHARE_URL_KIND}' }`,
    `name='${escapeDriveQueryValue(SHARE_URL_NAME)}'`,
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
    files?: Array<{ id: string }>;
    error?: unknown;
  };

  if (!searchRes.ok) {
    throw new DriveHttpError(
      'kakao-share.json search failed',
      searchRes.status,
      searchData
    );
  }

  const found = searchData.files ?? [];
  if (found.length > 0) {
    return { shareUrlFileId: found[0].id, reused: true };
  }

  // 2) 파일이 없는 경우 null 반환 (생성은 호출자에게 위임)
  return { shareUrlFileId: null, reused: false };
}
