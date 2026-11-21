import 'server-only';

import { randomUUID } from 'node:crypto';

import {
  visibilityStatus,
  type AudienceVisibility,
} from '@/features/invitation/audiences/visibility';

import {
  readAudienceVisibility,
  writeAudienceVisibility,
} from './audienceLinkStore';
import {
  assertWorkspacePrivate,
  commitCloneFile,
  DRIVE_FOLDER_MIME,
  inCloneBatches,
  InvitationCloneError,
  listCloneFiles,
  loadCloneJson,
  type CloneDriveFile,
} from './cloneDriveFiles';
import { withCloneLock } from './cloneInvitationLock';
import {
  APP_IDENTIFIER,
  upsertInvitationMeta,
} from './ensureInvitationMetaFile';
import { THUMBNAIL_KIND } from './ensureThumbnailFile';
import { guestPath } from './guestReadiness';
import { readAudienceFolder } from './invitationAudienceFolders';
import { readRootInvitationFiles } from './invitationAudiences';
import { assertInvitationFolderAccess, getDriveFile } from './previewAccess';
import { publishPermissionWithRetry } from './publishPermissionWithRetry';
import { revokePublicPermissionWithRetry } from './revokePublicPermissionWithRetry';

export function withVisibilityLock<T>(folderId: string, run: () => Promise<T>) {
  return withCloneLock(
    'visibility:' + folderId,
    run,
    () =>
      new InvitationCloneError(
        '공개 범위를 변경하고 있어요. 잠시 후 다시 시도해 주세요.',
        409
      )
  );
}

function isBaseAsset(file: CloneDriveFile) {
  const props = file.appProperties;
  if (props?.app_id !== APP_IDENTIFIER) return false;
  return file.mimeType === DRIVE_FOLDER_MIME
    ? props.kind === 'assets_images' || props.kind === 'assets_audios'
    : props.kind === THUMBNAIL_KIND;
}

// Older invitations also stored untagged media beside data.json or in images/audio.
// Never grant a whole unmarked folder based on its name.
async function legacyMediaTargets(
  files: CloneDriveFile[],
  dataId: string,
  basePublic: boolean
) {
  const isOwnedLegacyFile = (file: CloneDriveFile) =>
    file.ownedByMe && !file.appProperties?.kind && !file.appProperties?.app_id;
  const untagged = files.filter(isOwnedLegacyFile);
  let folders = untagged.filter(
    file =>
      file.mimeType === DRIVE_FOLDER_MIME &&
      ['image', 'images', 'audio', 'audios'].includes(file.name.toLowerCase())
  );
  while (folders.length > 0) {
    const children = await inCloneBatches(folders, folder =>
      listCloneFiles(folder.id)
    );
    folders = [];
    for (const file of children.flat()) {
      if (!isOwnedLegacyFile(file)) continue;
      if (file.mimeType === DRIVE_FOLDER_MIME) folders.push(file);
      else untagged.push(file);
    }
  }
  const media = untagged.filter(file =>
    /^(image|audio|video)\//.test(file.mimeType)
  );
  if (!media.length) return [];
  const references = new Set<string>();
  if (basePublic) {
    const payload = await loadCloneJson(dataId);
    if (!payload)
      throw new InvitationCloneError(
        '기본 초대장의 미디어를 확인하지 못했어요.',
        502
      );
    for (const token of JSON.stringify(payload).match(/[\w-]+/g) ?? [])
      references.add(token);
  }
  return media
    .filter(
      file =>
        references.has(file.id) ||
        file.appProperties?.audience_base_asset === 'true'
    )
    .map(file => ({
      id: file.id,
      enabled: basePublic && references.has(file.id),
      mark: !file.appProperties?.audience_base_asset,
    }));
}

async function loadScope(folderId: string) {
  const root = await assertInvitationFolderAccess(folderId, {
    ownedOnly: true,
    allowAudience: false,
  });
  const { files, meta, dataFile } = await readRootInvitationFiles(folderId);
  if (!dataFile?.ownedByMe)
    throw new InvitationCloneError('저장된 초대장을 확인할 수 없어요.', 404);
  const audiences = files.flatMap(file => {
    const audience = readAudienceFolder(file);
    return file.ownedByMe && audience?.rootFolderId === folderId
      ? [audience.group]
      : [];
  });
  const groups = [
    { slug: '', name: '기본 초대장' },
    ...audiences.map(({ slug, name }) => ({ slug, name })),
  ];
  const initial = {
    published: meta?.published === true,
    publicSlugs: groups.map(group => group.slug),
    revision: meta?.updatedAt ?? 'initial',
    pending: false,
  };
  let visibility: AudienceVisibility = initial;
  if (root.appProperties?.audience_visibility) {
    const stored = await readAudienceVisibility(dataFile.id);
    if (!stored)
      throw new InvitationCloneError(
        '저장된 공개 범위를 확인하지 못했어요.',
        503
      );
    visibility =
      root.appProperties.audience_visibility === 'pending'
        ? { ...stored, pending: true }
        : stored;
  }
  return { root, groups, audiences, files, dataFile, meta, visibility };
}

export async function getVisibilityOptions(folderId: string) {
  const { groups, visibility } = await loadScope(folderId);
  return { groups, visibility };
}

async function setPublicAccess(fileId: string, enabled: boolean) {
  const result = await (
    enabled ? publishPermissionWithRetry : revokePublicPermissionWithRetry
  )(fileId);
  if (!result.ok)
    throw new InvitationCloneError(
      'Drive 공개 권한 변경을 완료하지 못했어요. 다시 적용해 주세요.',
      result.status ?? 502
    );
}

// Drive IDs come from the server's invitation preparation or thumbnail upload.
export async function syncNewBaseFiles(folderId: string, fileIds: string[]) {
  const folder = await getDriveFile(folderId);
  if (!folder?.appProperties?.audience_visibility) return;
  await withVisibilityLock(folderId, async () => {
    const root = await assertInvitationFolderAccess(folderId, {
      ownedOnly: true,
      allowAudience: false,
    });
    const props = root.appProperties;
    if (
      props?.audience_base_public === 'true' &&
      props.audience_visibility !== 'pending'
    ) {
      await inCloneBatches(fileIds, id => setPublicAccess(id, true));
    }
  });
}

/** Called under the same per-event lock as whole-folder publishing. */
export async function applyAudienceVisibility(
  folderId: string,
  published: boolean,
  selection?: { publicSlugs: string[]; revision: string },
  preserveScope = false
) {
  const { root, groups, audiences, dataFile, meta, visibility } =
    await loadScope(folderId);
  const dataId = dataFile.id;
  const guestUrl = meta?.guestUrl || guestPath(dataId);
  if (
    preserveScope ||
    (!selection && published === visibility.published && !visibility.pending)
  ) {
    return { groups, visibility, guestUrl, dataJsonFileId: dataId };
  }
  const allowed = new Set(selection?.publicSlugs ?? visibility.publicSlugs);
  if (
    selection &&
    (selection.revision !== visibility.revision ||
      [...allowed].some(slug => !groups.some(group => group.slug === slug)))
  ) {
    throw new InvitationCloneError(
      '공개 범위가 변경됐어요. 최신 설정을 다시 열어 주세요.',
      409
    );
  }
  if (published && !groups.some(group => allowed.has(group.slug)))
    throw new InvitationCloneError(
      '공개할 초대장을 하나 이상 선택해 주세요.',
      400
    );
  await assertWorkspacePrivate(root.workspaceFolderId);
  const desired: AudienceVisibility = {
    published,
    publicSlugs: [...allowed],
    revision: randomUUID(),
    pending: true,
  };
  await writeAudienceVisibility(dataId, desired);
  await commitCloneFile(folderId, { audience_visibility: 'pending' });

  // Remove inherited public access before granting any individual version.
  await setPublicAccess(folderId, false);
  const files = await listCloneFiles(folderId);
  const basePublic = published && allowed.has('');
  const targets: { id: string; enabled: boolean; mark?: boolean }[] = [
    ...(await legacyMediaTargets(files, dataId, basePublic)),
    ...files
      .filter(
        file => file.ownedByMe && (file.id === dataId || isBaseAsset(file))
      )
      .map(file => ({ id: file.id, enabled: basePublic })),
    ...audiences.map(group => ({
      id: group.folderId,
      enabled: published && allowed.has(group.slug),
    })),
  ];
  await inCloneBatches(
    targets.filter(target => !target.enabled),
    target => setPublicAccess(target.id, false)
  );
  await inCloneBatches(
    targets.filter(target => target.enabled),
    async target => {
      if (target.mark)
        await commitCloneFile(target.id, { audience_base_asset: 'true' });
      await setPublicAccess(target.id, true);
    }
  );
  await upsertInvitationMeta(folderId, {
    published,
    guestUrl,
    dataJsonFileId: dataId,
  });
  const applied = { ...desired, pending: false };
  await writeAudienceVisibility(dataId, applied);
  await commitCloneFile(folderId, {
    audience_visibility: visibilityStatus({ groups, visibility: applied }),
    audience_public_count: String(allowed.size),
    audience_base_public: String(basePublic),
  });
  return { groups, visibility: applied, guestUrl, dataJsonFileId: dataId };
}
