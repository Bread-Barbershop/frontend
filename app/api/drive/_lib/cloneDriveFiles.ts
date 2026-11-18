import 'server-only';

import { DriveHttpError } from './ensureWorkspace';
import { escapeDriveQueryValue } from './escapeQueryValue';
import { googleFetch } from './googleFetch';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const FILE_FIELDS =
  'id,name,mimeType,appProperties,createdTime,trashed,parents';
const BATCH_SIZE = 5;

export const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
export const DRIVE_JSON_MIME = 'application/json';

export type CloneDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  appProperties?: Record<string, string>;
  trashed?: boolean;
  parents?: string[];
};

export class InvitationCloneError extends DriveHttpError {
  constructor(message: string, status: number) {
    super(message, status, null);
  }
}

function fileUrl(fileId: string) {
  return `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}`;
}

async function request(url: string, init: RequestInit = {}) {
  return googleFetch(url, {
    signal: AbortSignal.timeout(12_000),
    cache: 'no-store',
    ...init,
  });
}

async function readJson<T>(response: Response, operation: string): Promise<T> {
  if (!response.ok) {
    throw new DriveHttpError(
      operation,
      response.status,
      await response.json().catch(() => null)
    );
  }

  return (await response.json()) as T;
}

function writeJson(url: string, method: 'POST' | 'PATCH', body: unknown) {
  return request(url, {
    method,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(body),
  });
}

export async function inCloneBatches<T, Result>(
  items: T[],
  run: (item: T) => Promise<Result>
) {
  const results: Result[] = [];
  for (let offset = 0; offset < items.length; offset += BATCH_SIZE) {
    // 정리는 진행 중인 파일 쓰기까지 모두 끝난 뒤 실행해야 한다.
    const batch = await Promise.allSettled(
      items.slice(offset, offset + BATCH_SIZE).map(run)
    );
    for (const result of batch) {
      if (result.status === 'rejected') throw result.reason;
      results.push(result.value);
    }
  }
  return results;
}

export async function listCloneFiles(parentId: string, filters: string[] = []) {
  const result: CloneDriveFile[] = [];
  const params = new URLSearchParams({
    q: [
      `'${escapeDriveQueryValue(parentId)}' in parents`,
      'trashed=false',
      ...filters,
    ].join(' and '),
    spaces: 'drive',
    fields: `files(${FILE_FIELDS}),nextPageToken`,
    orderBy: 'createdTime',
    pageSize: '1000',
  });

  let nextPageToken: string | undefined;
  do {
    if (nextPageToken) params.set('pageToken', nextPageToken);
    const response = await request(`${DRIVE_FILES_URL}?${params}`);
    const page = await readJson<{
      files?: CloneDriveFile[];
      nextPageToken?: string;
    }>(response, 'Clone files list failed');
    result.push(...(page.files ?? []));
    nextPageToken = page.nextPageToken;
  } while (nextPageToken);

  return result;
}

export async function getCloneFile(fileId: string) {
  const response = await request(`${fileUrl(fileId)}?fields=${FILE_FIELDS}`);
  if (response.status === 404) return null;
  return readJson<CloneDriveFile>(response, 'Clone file lookup failed');
}

export async function assertWorkspacePrivate(folderId: string) {
  const response = await request(
    `${fileUrl(folderId)}?fields=permissions(type)`
  );
  const file = await readJson<{ permissions?: { type: string }[] }>(
    response,
    'Workspace permission lookup failed'
  );
  if (file.permissions?.some(permission => permission.type === 'anyone')) {
    throw new InvitationCloneError(
      'Drive에서 작업공간을 비공개로 변경한 뒤 다시 시도해 주세요.',
      409
    );
  }
}

export async function createCloneFile(input: {
  name: string;
  mimeType: string;
  parentId: string;
  appProperties?: Record<string, string>;
}) {
  const { parentId, ...metadata } = input;
  return readJson<CloneDriveFile>(
    await writeJson(`${DRIVE_FILES_URL}?fields=${FILE_FIELDS}`, 'POST', {
      ...metadata,
      parents: [parentId],
    }),
    'Clone destination create failed'
  );
}

export async function copyCloneAsset(
  file: CloneDriveFile,
  destinationId: string
) {
  return readJson<CloneDriveFile>(
    await writeJson(`${fileUrl(file.id)}/copy?fields=${FILE_FIELDS}`, 'POST', {
      name: file.name,
      parents: [destinationId],
      appProperties: file.appProperties,
    }),
    'Clone asset copy failed'
  );
}

export async function loadCloneJson(fileId: string): Promise<unknown> {
  const response = await request(`${fileUrl(fileId)}?alt=media`);
  if (!response.ok) {
    return readJson(response, 'Clone data download failed');
  }
  return response.json().catch(() => null);
}

export async function writeCloneData(fileId: string, payload: unknown) {
  const response = await writeJson(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`,
    'PATCH',
    payload
  );
  if (!response.ok) await readJson(response, 'Clone data upload failed');
}

export async function commitCloneFile(
  folderId: string,
  appProperties: Record<string, string>
) {
  const response = await writeJson(fileUrl(folderId), 'PATCH', {
    appProperties,
  });
  if (!response.ok) await readJson(response, 'Clone folder commit failed');
}

export async function deleteCloneFile(folderId: string) {
  const response = await request(fileUrl(folderId), { method: 'DELETE' });
  if (!response.ok && response.status !== 404) {
    await readJson(response, 'Clone cleanup failed');
  }
}
