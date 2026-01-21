import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/oauthTest/utils/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
  appProperties?: Record<string, string>;
};

export type EnsureAssetsFolderResult = {
  imageFolderId: string;
  audioFolderId: string;
  meta: {
    imageReused: boolean;
    audioReused: boolean;
  };
};

const APP_IDENTIFIER = 'Bread-Barbershop';

// 폴더 이름은 UX/가독성용, “정확한 식별”은 appProperties.kind.
const IMAGES_FOLDER_NAME = 'images';
const AUDIOS_FOLDER_NAME = 'audios';

// appProperties.kind 값(역할 식별자)
const IMAGES_KIND = 'assets_images';
const AUDIOS_KIND = 'assets_audios';

/**
 * invitationFolderId 하위에 images/audios 폴더를 보장한다.
 * - 있으면 재사용
 * - 없으면 생성
 *
 * 최적화:
 * - list 1번으로 두 폴더 존재 여부를 동시에 확인
 * - 없는 것만 create를 병렬로 수행(Promise.all)
 */
export async function ensureAssetsFolder(
  invitationFolderId: string
): Promise<EnsureAssetsFolderResult> {
  if (!invitationFolderId) {
    throw new DriveHttpError('invitationFolderId가 필요합니다.', 400, {
      invitationFolderId,
    });
  }

  // 1) list 한 번으로 images/audios 둘 다 찾기
  const q = [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `(${[
      `appProperties has { key='kind' and value='${IMAGES_KIND}' }`,
      `appProperties has { key='kind' and value='${AUDIOS_KIND}' }`,
    ].join(' or ')})`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime,appProperties)',
    pageSize: '10',
  });

  const listRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
  );

  const listData = (await listRes.json().catch(() => ({}))) as {
    files?: DriveFile[];
    error?: unknown;
  };

  if (!listRes.ok) {
    throw new DriveHttpError('에셋 폴더 검색 실패', listRes.status, listData);
  }

  const files = listData.files ?? [];
  const imagesExisting = files.find(f => f.appProperties?.kind === IMAGES_KIND);
  const audiosExisting = files.find(f => f.appProperties?.kind === AUDIOS_KIND);

  // 2) 없는 것만 create (두 개까지 병렬)
  const createImages = async () => {
    if (imagesExisting?.id) return { id: imagesExisting.id, reused: true };

    const res = await googleFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: IMAGES_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: IMAGES_KIND,
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      error?: unknown;
    };

    if (!res.ok || !data.id) {
      throw new DriveHttpError('images 폴더 생성 실패', res.status, data);
    }
    return { id: data.id, reused: false };
  };

  const createAudios = async () => {
    if (audiosExisting?.id) return { id: audiosExisting.id, reused: true };

    const res = await googleFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: AUDIOS_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: AUDIOS_KIND,
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      error?: unknown;
    };

    if (!res.ok || !data.id) {
      throw new DriveHttpError('audios 폴더 생성 실패', res.status, data);
    }
    return { id: data.id, reused: false };
  };

  const [images, audios] = await Promise.all([createImages(), createAudios()]);

  return {
    imageFolderId: images.id,
    audioFolderId: audios.id,
    meta: {
      imageReused: images.reused,
      audioReused: audios.reused,
    },
  };
}
