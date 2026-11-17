import 'server-only';

import { DriveHttpError } from './ensureWorkspace';
import { findWorkspaceFolderId } from './findWorkspaceFolderId';
import { googleFetch } from './googleFetch';

const APP_ID = 'Bread-Barbershop';
const FOLDER = 'application/vnd.google-apps.folder';

export type ManagedDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  trashed?: boolean;
  ownedByMe?: boolean;
  appProperties?: Record<string, string>;
};

export function assertDriveId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(value)) {
    throw new DriveHttpError('올바른 Drive 파일 ID가 필요합니다.', 400, {});
  }
}

function forbidden(): never {
  throw new DriveHttpError(
    '인비아에서 관리하는 파일만 사용할 수 있습니다.',
    403,
    {}
  );
}

export function assertSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (
    request.headers.get('sec-fetch-site') === 'cross-site' ||
    (origin && origin !== new URL(request.url).origin)
  )
    forbidden();
}

export async function readManagedDriveMetadata(
  id: string
): Promise<ManagedDriveFile> {
  assertDriveId(id);
  const response = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,parents,trashed,ownedByMe,appProperties`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    throw new DriveHttpError(
      'Drive 파일을 확인할 수 없습니다.',
      response.status,
      {}
    );
  }
  const file = (await response.json()) as ManagedDriveFile;
  if (file.id !== id || file.trashed || file.ownedByMe !== true) forbidden();
  return file;
}

function isInvitation(file: ManagedDriveFile) {
  return (
    file.mimeType === FOLDER &&
    file.appProperties?.app_id === APP_ID &&
    file.appProperties.kind === 'invitation' &&
    Boolean(file.appProperties.inv_id)
  );
}

async function workspaceId() {
  const id = await findWorkspaceFolderId();
  if (!id) forbidden();
  const workspace = await readManagedDriveMetadata(id);
  if (
    workspace.mimeType !== FOLDER ||
    workspace.appProperties?.app_id !== APP_ID
  )
    forbidden();
  return id;
}

export async function assertInvitationAccess(folderId: string) {
  assertDriveId(folderId);
  const workspace = await workspaceId();
  const folder = await readManagedDriveMetadata(folderId);
  if (!isInvitation(folder) || !folder.parents?.includes(workspace))
    forbidden();
  return folder;
}

/** 이름을 신뢰하지 않고 소유권과 실제 부모 체인으로 초대장 소속을 확인한다. */
export async function assertManagedFileAccess(
  fileId: string,
  expectedInvitationId?: string
) {
  assertDriveId(fileId);
  if (expectedInvitationId) assertDriveId(expectedInvitationId);
  const workspace = await workspaceId();
  const file = await readManagedDriveMetadata(fileId);
  let current = file;
  const seen = new Set<string>();
  for (let depth = 0; depth < 5; depth++) {
    if (seen.has(current.id)) forbidden();
    seen.add(current.id);
    if (isInvitation(current) && current.parents?.includes(workspace)) {
      if (expectedInvitationId && current.id !== expectedInvitationId)
        forbidden();
      return { file, invitationFolderId: current.id, invitation: current };
    }
    const parentId = current.parents?.[0];
    if (!parentId || parentId === workspace) forbidden();
    current = await readManagedDriveMetadata(parentId);
  }
  return forbidden();
}

export async function assertAssetFolderAccess(folderId: string) {
  const result = await assertManagedFileAccess(folderId);
  if (
    result.file.mimeType !== FOLDER ||
    result.file.appProperties?.app_id !== APP_ID ||
    !['assets_images', 'assets_audios'].includes(result.file.appProperties.kind)
  )
    forbidden();
  return result;
}

export async function assertDeletableFileAccess(fileId: string) {
  const result = await assertManagedFileAccess(fileId);
  if (
    !isInvitation(result.file) &&
    !/^(image|audio)\//.test(result.file.mimeType)
  )
    forbidden();
  return result;
}
