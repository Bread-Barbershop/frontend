import 'server-only';

import type { AudienceGroup } from '@/features/invitation/audiences/model';

import { DRIVE_FOLDER_MIME, getCloneFile } from './cloneDriveFiles';
import { APP_IDENTIFIER } from './ensureInvitationMetaFile';
import { DriveHttpError } from './ensureWorkspace';
import { escapeDriveQueryValue } from './escapeQueryValue';
import { googleFetch } from './googleFetch';

export const INVITATION_KIND = 'invitation';
export const AUDIENCE_KIND = 'invitation_audience';
export const AUDIENCE_STAGE_KIND = 'invitation_audience_staging';
export const CLONE_STAGE_KIND = 'invitation_clone_staging';
export const AUDIENCE_UUID_PREFIX = 'aud_';

export type InvitationDriveFolder = {
  id?: string;
  mimeType?: string;
  parents?: string[];
  trashed?: boolean;
  ownedByMe?: boolean;
  appProperties?: Record<string, string>;
};

export function isInvitationAuxiliaryFolder(kind?: string) {
  return (
    kind === AUDIENCE_KIND ||
    kind === AUDIENCE_STAGE_KIND ||
    kind === CLONE_STAGE_KIND
  );
}

export function isRootInvitationFolder(
  file: InvitationDriveFolder,
  workspaceFolderId: string
) {
  return (
    Boolean(file.id) &&
    !file.trashed &&
    file.mimeType === DRIVE_FOLDER_MIME &&
    file.parents?.includes(workspaceFolderId) &&
    file.appProperties?.app_id === APP_IDENTIFIER &&
    file.appProperties.kind === INVITATION_KIND
  );
}

export function readAudienceFolder(file: InvitationDriveFolder) {
  const props = file.appProperties;
  if (
    !file.id ||
    file.trashed ||
    file.mimeType !== DRIVE_FOLDER_MIME ||
    props?.app_id !== APP_IDENTIFIER ||
    props.kind !== AUDIENCE_KIND ||
    !props.audience_root ||
    !file.parents?.includes(props.audience_root) ||
    !props.audience_slug ||
    !props.audience_name ||
    !props.inv_id
  ) {
    return null;
  }

  const group: AudienceGroup = {
    name: props.audience_name,
    slug: props.audience_slug,
    folderId: file.id,
    invitationUuid: props.inv_id,
  };

  return { rootFolderId: props.audience_root, group };
}

export async function findOwnedAudienceByUuid(
  workspaceFolderId: string,
  invitationUuid: string
) {
  const params = new URLSearchParams({
    q: [
      'trashed=false',
      "'me' in owners",
      `mimeType='${DRIVE_FOLDER_MIME}'`,
      `appProperties has { key='app_id' and value='${APP_IDENTIFIER}' }`,
      `appProperties has { key='kind' and value='${AUDIENCE_KIND}' }`,
      `appProperties has { key='inv_id' and value='${escapeDriveQueryValue(invitationUuid)}' }`,
    ].join(' and '),
    spaces: 'drive',
    fields: 'files(id,mimeType,parents,appProperties)',
    pageSize: '1',
  });
  const response = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    {
      cache: 'no-store',
    }
  );
  const data = (await response.json().catch(() => ({}))) as {
    files?: InvitationDriveFolder[];
  };
  if (!response.ok) {
    throw new DriveHttpError(
      '하객 그룹을 찾지 못했습니다.',
      response.status,
      data
    );
  }

  const candidate = data.files?.[0];
  const audience = candidate && readAudienceFolder(candidate);
  if (!audience) return null;
  const root = await getCloneFile(audience.rootFolderId);
  return root?.ownedByMe && isRootInvitationFolder(root, workspaceFolderId)
    ? audience
    : null;
}
