import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

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

export async function loadInvitations(id: string): Promise<DriveListResponse> {
  const listRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents&fields=files(id, name, mimeType)`,
    { cache: 'no-store' }
  );
  const listData = (await listRes
    .json()
    .catch(() => ({}))) as DriveListResponse;

  if (!listRes.ok) {
    throw new DriveHttpError('초대장 목록 조회 실패', listRes.status, listData);
  }
  console.log('data:::', listData);

  return listData;
}

export async function downloadFiles(id: string): Promise<DriveListResponse> {
  const listRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    { cache: 'no-store' }
  );
  const listData = (await listRes
    .json()
    .catch(() => ({}))) as DriveListResponse;

  if (!listRes.ok) {
    throw new DriveHttpError('초대장 목록 조회 실패', listRes.status, listData);
  }
  console.log('data:::', listData);

  return listData;
}
