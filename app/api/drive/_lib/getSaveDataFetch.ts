import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { JsonData } from '@/app/editor/[id]/types/savedata';

export type InviteListItem = {
  folderId: string;
  name: string;
  createdTime?: string;
  invitationUuid?: string;
};

export type DriveListResponse = {
  files?: Array<{
    id?: string;
    name?: string;
    mimeType?: string;
  }>;

  error?: unknown;
};

export type LoadInvitationsResult = {
  invites: InviteListItem[];
  nextPageToken: string | null;
  emptyReason?: string;
};

export async function loadInvitations(
  id: string | null
): Promise<DriveListResponse | null> {
  if (!id) return null;
  try {
    const listRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents&fields=files(id, name, mimeType)`,
      { cache: 'no-store' }
    );
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

    return listData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function downloadFiles(id: string): Promise<JsonData | null> {
  try {
    const listRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
      { cache: 'no-store' }
    );
    const listData = await listRes.json();

    if (!listRes.ok) {
      throw new DriveHttpError(
        '초대장 파일 다운로드 실패',
        listRes.status,
        listData
      );
    }

    return listData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getFilesInFolder(
  folderId: string
): Promise<DriveListResponse | null> {
  try {
    // q 파라미터는 띄어쓰기가 포함되므로 인코딩이 필요합니다.
    const query = encodeURIComponent(
      `'${folderId}' in parents and trashed = false`
    );

    // fields를 지정하면 응답 속도가 빨라지고 데이터가 깔끔해집니다.
    const fields = encodeURIComponent(
      'files(id, name, mimeType, size, thumbnailLink, createdTime)'
    );

    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}`;

    const listRes = await googleFetch(url, { cache: 'no-store' });
    const data = (await listRes.json()) as DriveListResponse;
    if (!listRes.ok) {
      throw new DriveHttpError(
        '폴더 내 파일 목록 조회 실패',
        listRes.status,
        data
      );
    }

    return data; // { files: [...] }
  } catch (error) {
    console.error(error);
    return null;
  }
}
