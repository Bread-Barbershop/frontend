import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

const APP_IDENTIFIER = 'Bread-Barbershop';
const KAKAO_SHARE_NAME = 'kakao-share.json';
const KAKAO_SHARE_KIND = 'kakao_share_json';

export type KakaoSharePayload = {
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

const DEFAULT_KAKAO_SHARE_PAYLOAD: KakaoSharePayload = {
  title: '',
  description: '',
  imageFileId: undefined,
  showLocationButton: false,
  showShareButton: true,
};

export type EnsureKakaoShareFileResult = {
  kakaoShareFileId: string;
  reused: boolean;
};

/**
 * invitation 폴더 내에 단일 kakao-share.json 파일이 존재하는지 확인합니다.
 * 파일이 없는 경우, 파일을 생성하고 기본 페이로드로 초기화합니다.
 *
 * 기존 ensureDataJsonFile 패턴과 동일한 방식으로 동작합니다.
 */
export async function ensureKakaoShareFile(
  invitationFolderId: string
): Promise<EnsureKakaoShareFileResult> {
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
    `appProperties has { key='kind' and value='${KAKAO_SHARE_KIND}' }`,
    `name='${escapeDriveQueryValue(KAKAO_SHARE_NAME)}'`,
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
    return { kakaoShareFileId: found[0].id, reused: true };
  }

  // 2) 파일 메타데이터 생성
  const createRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: KAKAO_SHARE_NAME,
        mimeType: 'application/json',
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: KAKAO_SHARE_KIND,
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
      'kakao-share.json create failed',
      createRes.status,
      created
    );
  }

  // 3) 기본 페이로드 초기화
  const initRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      created.id
    )}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(DEFAULT_KAKAO_SHARE_PAYLOAD),
    }
  );

  if (!initRes.ok) {
    const initDetails = await initRes.json().catch(() => undefined);
    throw new DriveHttpError(
      'kakao-share.json default payload init failed',
      initRes.status,
      initDetails
    );
  }

  return { kakaoShareFileId: created.id, reused: false };
}
