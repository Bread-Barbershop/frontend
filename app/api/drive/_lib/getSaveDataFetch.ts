import 'server-only';

import { captureDriveError } from '@/app/api/drive/_lib/captureDriveError';
import {
  DRIVE_FOLDER_MIME,
  listCloneFiles,
} from '@/app/api/drive/_lib/cloneDriveFiles';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { isInvitationAuxiliaryFolder } from '@/app/api/drive/_lib/invitationAudienceFolders';
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
    appProperties?: Record<string, string>;
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
    const files = await listCloneFiles(id);
    return {
      files: files.filter(
        file => !isInvitationAuxiliaryFolder(file.appProperties?.kind)
      ),
    };
  } catch (error) {
    captureDriveError({ error, operation: 'drive_editor_load_list' });
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
    captureDriveError({ error, operation: 'drive_editor_load_data' });
    console.error(error);
    return null;
  }
}

export async function getFilesInFolder(
  folderId: string
): Promise<DriveListResponse | null> {
  try {
    const files = [];
    const folders = [folderId];
    for (const currentFolderId of folders) {
      for (const file of await listCloneFiles(currentFolderId)) {
        if (isInvitationAuxiliaryFolder(file.appProperties?.kind)) continue;
        if (file.mimeType === DRIVE_FOLDER_MIME) folders.push(file.id);
        else files.push(file);
      }
    }
    return { files };
  } catch (error) {
    captureDriveError({ error, operation: 'drive_editor_load_assets' });
    console.error(error);
    return null;
  }
}
