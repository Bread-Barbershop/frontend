import 'server-only';

import { ensureShareUrlFile } from '@/app/api/drive/_lib/ensureShareUrlFile';
import {
  THUMBNAIL_KIND,
  THUMBNAIL_NAME,
} from '@/app/api/drive/_lib/ensureThumbnailFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { escapeDriveQueryValue } from '@/app/api/drive/_lib/escapeQueryValue';
import { findWorkspaceFolderId } from '@/app/api/drive/_lib/findWorkspaceFolderId';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { InviteListItem, LoadInvitationResponse } from '@/app/dashboard/types';

const APP_IDENTIFIER = 'Bread-Barbershop';
const INVITATION_KIND = 'invitation';
const PUBLISHED_JSON_NAME = 'published.json';
const PUBLISHED_JSON_KIND = 'invitation_published_json';

type DriveListResponse = {
  files?: Array<{
    id?: string;
    name?: string;
    createdTime?: string;
    appProperties?: Record<string, string>;
  }>;
  nextPageToken?: string;
  error?: unknown;
};

type DriveSearchResponse = {
  files?: Array<{
    id?: string;
  }>;
  error?: unknown;
};

function isThumbnailPayload(value: unknown): value is {
  dataUrl: string;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dataUrl' in value &&
    typeof value.dataUrl === 'string'
  );
}

function isPublishedPayload(value: unknown): value is {
  guestUrl: string;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'guestUrl' in value &&
    typeof value.guestUrl === 'string'
  );
}

async function loadPublishedUrl(
  invitationFolderId: string
): Promise<string | null> {
  try {
    const q = [
      `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
      `trashed=false`,
      `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
        APP_IDENTIFIER
      )}' }`,
      `appProperties has { key='kind' and value='${PUBLISHED_JSON_KIND}' }`,
      `name='${escapeDriveQueryValue(PUBLISHED_JSON_NAME)}'`,
    ].join(' and ');

    const searchParams = new URLSearchParams({
      q,
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: '1',
    });

    const searchRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
      { cache: 'no-store' }
    );
    const searchData = (await searchRes
      .json()
      .catch(() => ({}))) as DriveSearchResponse;

    if (!searchRes.ok) {
      return null;
    }

    const publishedFileId = searchData.files?.[0]?.id;
    if (!publishedFileId) {
      return null;
    }

    const contentRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        publishedFileId
      )}?alt=media`,
      { cache: 'no-store' }
    );

    if (!contentRes.ok) {
      return null;
    }

    const content = (await contentRes.json().catch(() => null)) as unknown;
    return isPublishedPayload(content) ? content.guestUrl : null;
  } catch {
    return null;
  }
}

async function loadThumbnailUrl(
  invitationFolderId: string
): Promise<string | null> {
  try {
    const q = [
      `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
      `trashed=false`,
      `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
        APP_IDENTIFIER
      )}' }`,
      `appProperties has { key='kind' and value='${THUMBNAIL_KIND}' }`,
      `name='${escapeDriveQueryValue(THUMBNAIL_NAME)}'`,
    ].join(' and ');

    const searchParams = new URLSearchParams({
      q,
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: '1',
    });

    const searchRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
      { cache: 'no-store' }
    );
    const searchData = (await searchRes
      .json()
      .catch(() => ({}))) as DriveSearchResponse;

    if (!searchRes.ok) {
      return null;
    }

    const thumbnailFileId = searchData.files?.[0]?.id;
    if (!thumbnailFileId) {
      return null;
    }

    const contentRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        thumbnailFileId
      )}?alt=media`,
      { cache: 'no-store' }
    );

    if (!contentRes.ok) {
      return null;
    }

    const content = (await contentRes.json().catch(() => null)) as unknown;
    return isThumbnailPayload(content) ? content.dataUrl : null;
  } catch {
    return null;
  }
}

async function hasKakaoShareData(invitationFolderId: string): Promise<boolean> {
  try {
    const { shareUrlFileId } = await ensureShareUrlFile(invitationFolderId);
    return Boolean(shareUrlFileId);
  } catch {
    return false;
  }
}

export async function loadDashboardInvitations(): Promise<LoadInvitationResponse> {
  const workspaceFolderId = await findWorkspaceFolderId();

  if (!workspaceFolderId) {
    return {
      workspaceFolderId: null,
      invites: [],
      nextPageToken: null,
    };
  }

  const q = [
    `'${escapeDriveQueryValue(workspaceFolderId)}' in parents`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='${escapeDriveQueryValue(
      INVITATION_KIND
    )}' }`,
  ].join(' and ');

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('spaces', 'drive');
  url.searchParams.set('orderBy', 'createdTime desc');
  url.searchParams.set('pageSize', '100');
  url.searchParams.set(
    'fields',
    'files(id,name,createdTime,appProperties),nextPageToken'
  );

  const listRes = await googleFetch(url.toString(), { cache: 'no-store' });
  const listData = (await listRes
    .json()
    .catch(() => ({}))) as DriveListResponse;

  if (!listRes.ok) {
    throw new DriveHttpError('초대장 목록 조회 실패', listRes.status, listData);
  }

  const invitationFolders: InviteListItem[] = (listData.files ?? [])
    .filter(f => f.id && f.name)
    .map(f => ({
      folderId: f.id!,
      name: f.name!,
      createdTime: f.createdTime,
      invitationUuid: f.appProperties?.inv_id,
    }))
    .filter(x => Boolean(x.invitationUuid));

  const invites = await Promise.all(
    invitationFolders.map(async invite => {
      const [publishedUrl, thumbnailUrl, hasShareData] = await Promise.all([
        loadPublishedUrl(invite.folderId),
        loadThumbnailUrl(invite.folderId),
        hasKakaoShareData(invite.folderId),
      ]);
      return {
        ...invite,
        publishedUrl,
        thumbnailUrl,
        hasKakaoShareData: hasShareData,
      };
    })
  );

  return {
    workspaceFolderId,
    invites,
    nextPageToken: listData.nextPageToken ?? null,
  };
}
