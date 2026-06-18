import 'server-only';

import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import type {
  GuestPayloadWarning,
  NormalizedGuestPayload,
} from '@/app/guest/[id]/validation/parseGuestPayload';

import { APP_IDENTIFIER } from './ensureInvitationMetaFile';
import { DriveHttpError } from './ensureWorkspace';
import { escapeDriveQueryValue } from './escapeQueryValue';
import { findWorkspaceFolderId } from './findWorkspaceFolderId';
import { googleFetch } from './googleFetch';

const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const INVITATION_KIND = 'invitation';
const DATA_JSON_NAME = 'data.json';
// 에셋 파일은 images/audios 폴더처럼 초대장 폴더 아래 한두 단계에 위치한다.
// 순환이나 과도한 부모 탐색을 막기 위해 검증 깊이는 제한한다.
const MAX_PARENT_DEPTH = 4;

type DriveFile = {
  id?: string;
  name?: string;
  mimeType?: string;
  parents?: string[];
  trashed?: boolean;
  appProperties?: Record<string, string>;
};

type DriveFilesResponse = {
  files?: DriveFile[];
  error?: unknown;
};

export type PreviewErrorCode =
  | 'FOLDER_ID_REQUIRED'
  | 'FILE_ID_REQUIRED'
  | 'INVALID_ASSET_KIND'
  | 'INVITATION_NOT_FOUND'
  | 'ASSET_FORBIDDEN'
  | 'PREVIEW_DATA_DOWNLOAD_FAILED'
  | 'PREVIEW_ASSET_DOWNLOAD_FAILED'
  | 'INVALID_PREVIEW_DATA'
  | 'PREVIEW_UNKNOWN_ERROR';

export class PreviewAccessError extends Error {
  status: number;
  code: PreviewErrorCode;
  userMessage: string;
  details?: unknown;

  constructor(params: {
    code: PreviewErrorCode;
    status: number;
    message: string;
    userMessage: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'PreviewAccessError';
    this.code = params.code;
    this.status = params.status;
    this.userMessage = params.userMessage;
    this.details = params.details;
  }
}

export type PreviewInvitationPayload = {
  ok: true;
  dataJsonFileId: string;
  payload: NormalizedGuestPayload;
  warnings: GuestPayloadWarning[];
};

export type PreviewAssetKind = 'image' | 'audio';

export type PreviewAssetFile = {
  fileId: string;
  mimeType: string;
};

// API route에서 상태 코드와 사용자 안내 문구를 일관되게 내려주기 위한 전용 오류 객체를 만든다.
function previewError(
  code: PreviewErrorCode,
  status: number,
  message: string,
  userMessage: string,
  details?: unknown
) {
  return new PreviewAccessError({
    code,
    status,
    message,
    userMessage,
    details,
  });
}

async function getDriveFile(fileId: string): Promise<DriveFile | null> {
  const res = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?fields=id,name,mimeType,parents,trashed,appProperties`,
    { cache: 'no-store' }
  );

  const data = (await res.json().catch(() => ({}))) as DriveFile & {
    error?: unknown;
  };

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new DriveHttpError('Drive file lookup failed', res.status, data);
  }

  return data;
}

function isInvitationFolder(file: DriveFile, workspaceFolderId: string) {
  return (
    file.id &&
    !file.trashed &&
    file.mimeType === DRIVE_FOLDER_MIME_TYPE &&
    file.parents?.includes(workspaceFolderId) &&
    file.appProperties?.app_id === APP_IDENTIFIER &&
    file.appProperties?.kind === INVITATION_KIND
  );
}

async function getWorkspaceFolderIdOrThrow() {
  const workspaceFolderId = await findWorkspaceFolderId();
  if (!workspaceFolderId) {
    throw previewError(
      'INVITATION_NOT_FOUND',
      404,
      'Workspace folder not found',
      '초대장을 찾을 수 없습니다.'
    );
  }

  return workspaceFolderId;
}

/**
 * 대시보드 미리보기는 공개 여부와 무관하게 "내 workspace 안의 초대장"만 읽어야 한다.
 * folderId가 조작되어도 다른 Drive 폴더를 미리보기 데이터로 사용할 수 없도록 여기서 먼저 막는다.
 */
export async function assertInvitationFolderAccess(folderId: string) {
  if (!folderId) {
    throw previewError(
      'FOLDER_ID_REQUIRED',
      400,
      'folderId is required',
      '미리볼 초대장 정보를 찾지 못했습니다.'
    );
  }

  const workspaceFolderId = await getWorkspaceFolderIdOrThrow();
  const folder = await getDriveFile(folderId);

  if (!folder || !isInvitationFolder(folder, workspaceFolderId)) {
    throw previewError(
      'INVITATION_NOT_FOUND',
      404,
      'Invitation folder not found',
      '초대장을 찾을 수 없습니다.',
      { folderId }
    );
  }

  return folder;
}

async function findDataJsonFileId(invitationFolderId: string) {
  const q = [
    `'${escapeDriveQueryValue(invitationFolderId)}' in parents`,
    `trashed=false`,
    `name='${escapeDriveQueryValue(DATA_JSON_NAME)}'`,
  ].join(' and ');

  const searchParams = new URLSearchParams({
    q,
    spaces: 'drive',
    fields: 'files(id,name,mimeType,createdTime,appProperties)',
    orderBy: 'createdTime',
    pageSize: '1',
  });

  const res = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    { cache: 'no-store' }
  );

  const data = (await res.json().catch(() => ({}))) as DriveFilesResponse;

  if (!res.ok) {
    throw new DriveHttpError('data.json search failed', res.status, data);
  }

  return data.files?.[0]?.id ?? null;
}

async function downloadDataJson(dataJsonFileId: string) {
  const res = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      dataJsonFileId
    )}?alt=media`,
    { cache: 'no-store' }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw previewError(
      'PREVIEW_DATA_DOWNLOAD_FAILED',
      502,
      'Failed to download preview data',
      '초대장 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      data
    );
  }

  return data;
}

/**
 * 비공개 초대장은 브라우저 공개 URL로 data.json을 읽을 수 없다.
 * 서버가 로그인한 사용자의 OAuth 권한으로 data.json을 받은 뒤, 게스트 페이지와 같은 parser를 통과시킨다.
 */
export async function loadPreviewInvitationPayload(
  folderId: string
): Promise<PreviewInvitationPayload> {
  await assertInvitationFolderAccess(folderId);

  const dataJsonFileId = await findDataJsonFileId(folderId);
  if (!dataJsonFileId) {
    throw previewError(
      'INVITATION_NOT_FOUND',
      404,
      'data.json not found',
      '초대장을 찾을 수 없습니다.',
      { folderId }
    );
  }

  const rawPayload = await downloadDataJson(dataJsonFileId);
  const parsed = parseGuestPayload(rawPayload);

  if (!parsed.ok) {
    throw previewError(
      'INVALID_PREVIEW_DATA',
      422,
      'Invalid preview data',
      '초대장 데이터 형식이 올바르지 않습니다.',
      parsed
    );
  }

  return {
    ok: true,
    dataJsonFileId,
    payload: parsed.payload,
    warnings: parsed.warnings,
  };
}

/**
 * 이미지/BGM 프록시는 fileId만 믿지 않는다.
 * 파일이 요청한 초대장 폴더 하위에 있는지 부모 체인을 따라 확인해서 다른 Drive 파일 접근을 막는다.
 */
export async function assertDriveFileUnderInvitation(
  fileId: string,
  invitationFolderId: string
): Promise<DriveFile> {
  if (!fileId) {
    throw previewError(
      'FILE_ID_REQUIRED',
      400,
      'fileId is required',
      '미리보기 파일 정보를 찾지 못했습니다.'
    );
  }

  await assertInvitationFolderAccess(invitationFolderId);

  const file = await getDriveFile(fileId);
  if (!file || file.trashed) {
    throw previewError(
      'ASSET_FORBIDDEN',
      403,
      'Preview asset is not accessible',
      '이 미리보기 파일에 접근할 수 없습니다.',
      { fileId, invitationFolderId }
    );
  }

  let currentParents = file.parents ?? [];

  for (let depth = 0; depth < MAX_PARENT_DEPTH; depth += 1) {
    if (currentParents.includes(invitationFolderId)) {
      return file;
    }

    const nextParentId = currentParents[0];
    if (!nextParentId) break;

    const parent = await getDriveFile(nextParentId);
    if (!parent || parent.trashed) break;

    currentParents = parent.parents ?? [];
  }

  throw previewError(
    'ASSET_FORBIDDEN',
    403,
    'Preview asset is outside the invitation folder',
    '이 미리보기 파일에 접근할 수 없습니다.',
    { fileId, invitationFolderId }
  );
}

export function parsePreviewAssetKind(value: string | null): PreviewAssetKind {
  if (value === 'image' || value === 'audio') {
    return value;
  }

  throw previewError(
    'INVALID_ASSET_KIND',
    400,
    'Invalid preview asset kind',
    '미리보기 파일 정보를 찾지 못했습니다.',
    { kind: value }
  );
}

// kind=image 요청에 audio 파일을 붙이는 식의 오용을 막기 위한 최종 타입 검증이다.
export function validatePreviewAssetMimeType(
  file: PreviewAssetFile,
  kind: PreviewAssetKind
) {
  const mimeType = file.mimeType.toLowerCase();
  const expectedPrefix = `${kind}/`;

  if (!mimeType.startsWith(expectedPrefix)) {
    throw previewError(
      'PREVIEW_ASSET_DOWNLOAD_FAILED',
      502,
      'Unexpected preview asset mime type',
      '미리보기 파일을 불러오지 못했습니다.',
      { fileId: file.fileId, mimeType: file.mimeType, kind }
    );
  }
}
