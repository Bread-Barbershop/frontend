import 'server-only';

import { NextResponse } from 'next/server';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { escapeDriveQueryValue } from '@/app/api/drive/_lib/escapeQueryValue';
import { findWorkspaceFolderId } from '@/app/api/drive/_lib/findWorkspaceFolderId';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

const APP_IDENTIFIER = 'Bread-Barbershop';
const INVITATION_KIND = 'invitation';
const PUBLISHED_JSON_NAME = 'published.json';
const PUBLISHED_JSON_KIND = 'invitation_published_json';

type InviteListItem = {
  folderId: string;
  name: string;
  createdTime?: string;
  invitationUuid?: string;
  publishedUrl?: string | null;
};

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

function isPublishedPayload(
  value: unknown
): value is {
  guestUrl: string;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'guestUrl' in value &&
    typeof value.guestUrl === 'string'
  );
}

async function loadPublishedUrl(invitationFolderId: string): Promise<string | null> {
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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workspaceFolderId = await findWorkspaceFolderId();

    if (!workspaceFolderId) {
      return NextResponse.json(
        {
          workspaceFolderId: null,
          invites: [],
          nextPageToken: null,
          emptyReason: 'WORKSPACE_NOT_FOUND',
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
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
    const listData = (await listRes.json().catch(() => ({}))) as DriveListResponse;

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
      invitationFolders.map(async invite => ({
        ...invite,
        publishedUrl: await loadPublishedUrl(invite.folderId),
      }))
    );

    return NextResponse.json(
      {
        workspaceFolderId,
        invites,
        nextPageToken: listData.nextPageToken ?? null,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    if (err instanceof Error && err.message === '유효한 요청이 아닙니다.') {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }

    if (err instanceof Error && err.message === '재로그인이 필요합니다.') {
      return NextResponse.json(
        { message: '재로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: '초대장 목록을 불러오는 중 오류가 발생했습니다.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
