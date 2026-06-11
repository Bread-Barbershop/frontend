import 'server-only';

import { loadInvitationMeta } from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import {
  THUMBNAIL_KIND,
  THUMBNAIL_NAME,
} from '@/app/api/drive/_lib/ensureThumbnailFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { escapeDriveQueryValue } from '@/app/api/drive/_lib/escapeQueryValue';
import { findWorkspaceFolderId } from '@/app/api/drive/_lib/findWorkspaceFolderId';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { InviteListItem, LoadInvitationResponse } from '@/app/dashboard/types';
// import { measureAsync } from '@/shared/utils/performance';

const APP_IDENTIFIER = 'Bread-Barbershop';
const INVITATION_KIND = 'invitation';

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

    return `https://lh3.googleusercontent.com/d/${encodeURIComponent(thumbnailFileId)}`;
  } catch {
    return null;
  }
}

async function loadDashboardMeta(invitationFolderId: string) {
  try {
    return await loadInvitationMeta(invitationFolderId);
  } catch {
    return null;
  }
}

export async function loadDashboardInvitations(): Promise<LoadInvitationResponse> {
  // return measureAsync('Dashboard Load Total', async () => {
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
      guestUrl: null,
      published: false,
      readiness: 'idle' as const,
    }))
    .filter(x => Boolean(x.invitationUuid));

  const invites = await Promise.all(
    invitationFolders.map(async invite => {
      const [meta, thumbnailUrl] = await Promise.all([
        loadDashboardMeta(invite.folderId),
        loadThumbnailUrl(invite.folderId),
      ]);
      const metaPayload = meta?.payload;
      const guestUrl = metaPayload?.guestUrl ?? null;
      const dataJsonFileId = metaPayload?.dataJsonFileId ?? undefined;
      const published = metaPayload?.published ?? false;
      return {
        ...invite,
        dataJsonFileId,
        guestUrl,
        published,
        readiness: published
          ? guestUrl && dataJsonFileId
            ? ('ready' as const)
            : ('failed' as const)
          : ('idle' as const),
        thumbnailUrl,
        hasKakaoShareData: Boolean(metaPayload?.kakaoShare),
      };
    })
  );

  return {
    workspaceFolderId,
    invites,
    nextPageToken: listData.nextPageToken ?? null,
  };
  // });
}
