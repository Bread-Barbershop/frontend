import 'server-only';

import { NextResponse } from 'next/server';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { escapeDriveQueryValue } from '@/app/api/drive/_lib/escapeQueryValue';
import { findWorkspaceFolderId } from '@/app/api/drive/_lib/findWorkspaceFolderId';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

const APP_IDENTIFIER = 'Bread-Barbershop';
const INVITATION_KIND = 'invitation';

type InviteListItem = {
  folderId: string;
  name: string;
  createdTime?: string;
  invitationUuid?: string;
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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1) 워크스페이스 폴더 존재 확인
    const workspaceFolderId = await findWorkspaceFolderId();

    if (!workspaceFolderId) {
      // 워크스페이스가 없으면: "생성한 초대장이 없는걸로 간주"
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

    // 2) 워크스페이스 하위 "초대장 폴더" 목록 조회
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
      throw new DriveHttpError(
        '초대장 목록 조회 실패',
        listRes.status,
        listData
      );
    }

    const invites: InviteListItem[] = (listData.files ?? [])
      .filter(f => f.id && f.name)
      .map(f => ({
        folderId: f.id!,
        name: f.name!,
        createdTime: f.createdTime,
        invitationUuid: f.appProperties?.inv_id,
      }))
      .filter(x => !!x.invitationUuid);

    return NextResponse.json(
      {
        workspaceFolderId,
        invites,
        nextPageToken: listData.nextPageToken ?? null,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'auth_required') {
      return NextResponse.json(
        { message: '재로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        message: '알 수 없는 오류',
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
