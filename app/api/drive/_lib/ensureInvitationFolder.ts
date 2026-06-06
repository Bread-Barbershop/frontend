import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { escapeDriveQueryValue } from './escapeQueryValue';
import { generateUuid } from './generateUuid';

type DriveFile = {
  id: string;
  name?: string;
  createdTime?: string;
  appProperties?: Record<string, string>;
};

export type EnsureInvitationFolderResult = {
  invitationFolderId: string;
  invitationUuid: string;
  reused: boolean;
};

const DEFAULT_INVITATION_FOLDER_BASE_NAME = '초대장';
const INVITATION_FOLDER_TIME_ZONE = 'Asia/Seoul';
const APP_IDENTIFIER = 'Bread-Barbershop';
const INVITATION_KIND = 'invitation';

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function formatInvitationCreatedAt(createdAt: Date): string {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: INVITATION_FOLDER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(createdAt);

  const partMap = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  ) as Partial<Record<Intl.DateTimeFormatPartTypes, string>>;

  const year = partMap.year ?? String(createdAt.getFullYear());
  const month = partMap.month ?? padDatePart(createdAt.getMonth() + 1);
  const day = partMap.day ?? padDatePart(createdAt.getDate());
  const hour = partMap.hour ?? padDatePart(createdAt.getHours());
  const minute = partMap.minute ?? padDatePart(createdAt.getMinutes());

  return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
}

export function buildInvitationFolderName(params?: {
  baseName?: string | null;
  createdAt?: Date;
}): string {
  const baseName =
    params?.baseName?.trim() || DEFAULT_INVITATION_FOLDER_BASE_NAME;
  const createdAt = params?.createdAt ?? new Date();

  return `${baseName} - ${formatInvitationCreatedAt(createdAt)}`;
}

async function createDriveInvitationFolder(params: {
  workspaceFolderId: string;
  invitationUuid: string;
  baseName?: string | null;
}): Promise<string> {
  const createRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: buildInvitationFolderName({ baseName: params.baseName }),
        mimeType: 'application/vnd.google-apps.folder',
        parents: [params.workspaceFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: INVITATION_KIND,
          inv_id: params.invitationUuid,
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
      '초대장 폴더(uuid) 생성 실패',
      createRes.status,
      created
    );
  }

  return created.id;
}

/**
 * 초대장 폴더를 uuid 기준으로 보장한다.
 *
 * - invitationUuid가 있으면: 해당 uuid 폴더 검색 → 있으면 재사용
 * - invitationUuid가 없거나 못 찾으면: 새로 생성
 */
export async function ensureInvitationFolder(params: {
  workspaceFolderId: string;
  invitationUuid?: string;
  baseName?: string | null;
}): Promise<EnsureInvitationFolderResult> {
  const { workspaceFolderId } = params;

  if (!workspaceFolderId) {
    throw new DriveHttpError('workspaceFolderId가 필요합니다.', 400, {
      workspaceFolderId,
    });
  }

  const invitationUuid = params.invitationUuid ?? generateUuid();

  // 1) uuid 기반 검색 (이름은 조건에 넣지 않음)
  const q = [
    `'${escapeDriveQueryValue(workspaceFolderId)}' in parents`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `appProperties has { key='app_id' and value='${escapeDriveQueryValue(
      APP_IDENTIFIER
    )}' }`,
    `appProperties has { key='kind' and value='${INVITATION_KIND}' }`,
    `appProperties has { key='inv_id' and value='${escapeDriveQueryValue(
      invitationUuid
    )}' }`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,createdTime,appProperties)',
    orderBy: 'createdTime', // 가장 오래된 것을 정본으로 정함.
    pageSize: '10',         // 중복 방어
  });

  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
  );

  const searchData = (await searchRes.json().catch(() => ({}))) as {
    files?: DriveFile[];
    error?: unknown;
  };

  if (!searchRes.ok) {
    throw new DriveHttpError(
      '초대장 폴더(uuid) 검색 실패',
      searchRes.status,
      searchData
    );
  }

  const found = searchData.files ?? [];
  if (found.length > 0) {
    return {
      invitationFolderId: found[0].id,
      invitationUuid,
      reused: true,
    };
  }

  // 2) 없으면 생성
  const invitationFolderId = await createDriveInvitationFolder({
    workspaceFolderId,
    invitationUuid,
    baseName: params.baseName,
  });

  return {
    invitationFolderId,
    invitationUuid,
    reused: false,
  };
}

export async function createInvitationFolder(params: {
  workspaceFolderId: string;
  invitationUuid?: string;
  baseName?: string | null;
}): Promise<EnsureInvitationFolderResult> {
  const { workspaceFolderId } = params;

  if (!workspaceFolderId) {
    throw new DriveHttpError('workspaceFolderId가 필요합니다.', 400, {
      workspaceFolderId,
    });
  }

  const invitationUuid = params.invitationUuid ?? generateUuid();

  const invitationFolderId = await createDriveInvitationFolder({
    workspaceFolderId,
    invitationUuid,
    baseName: params.baseName,
  });

  return {
    invitationFolderId,
    invitationUuid,
    reused: false,
  };
}
