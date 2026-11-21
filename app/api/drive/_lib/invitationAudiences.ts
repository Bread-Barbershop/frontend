import 'server-only';

import { resolveShortCode } from '@/app/api/short-url/_lib/shortUrlStore';
import {
  buildAudienceGuestUrl,
  normalizeAudienceNameForComparison,
  type AudienceGroup,
  type AudienceGroupList,
} from '@/features/invitation/audiences/model';

import {
  claimAudienceLink,
  commitAudienceLink,
  refreshAudienceLink,
  releaseAudienceLink,
  resolveAudienceLink,
} from './audienceLinkStore';
import { captureDriveError } from './captureDriveError';
import {
  deleteCloneFile,
  inCloneBatches,
  InvitationCloneError,
  listCloneFiles,
} from './cloneDriveFiles';
import {
  cloneOwnedInvitation,
  createCloneRequestKey,
  findSavedInvitationDataFile,
  findSavedInvitationMetaFile,
} from './cloneInvitation';
import { cloneInProgress } from './cloneInvitationLock';
import {
  APP_IDENTIFIER,
  loadInvitationMetaByFileId,
} from './ensureInvitationMetaFile';
import { generateUuid } from './generateUuid';
import { guestPath } from './guestReadiness';
import {
  AUDIENCE_KIND,
  AUDIENCE_STAGE_KIND,
  AUDIENCE_UUID_PREFIX,
  INVITATION_KIND,
  isInvitationAuxiliaryFolder,
  readAudienceFolder,
} from './invitationAudienceFolders';
import { assertInvitationFolderAccess, getDriveFile } from './previewAccess';

export function getInvitationPublicOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin;
}

async function resolveRootGuestUrl(
  publicOrigin: string,
  dataJsonFileId: string,
  savedGuestUrl?: string | null
) {
  const fallback = new URL(guestPath(dataJsonFileId), publicOrigin).href;
  if (!savedGuestUrl) return fallback;

  try {
    const url = new URL(savedGuestUrl, publicOrigin);
    if (
      url.origin !== new URL(publicOrigin).origin ||
      url.username ||
      url.password
    )
      return fallback;
    const shortCode = /^\/i\/([A-Za-z0-9]{4,32})$/.exec(url.pathname)?.[1];
    if (shortCode && (await resolveShortCode(shortCode)) === dataJsonFileId) {
      return new URL(url.pathname, publicOrigin).href;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

async function readRootInvitationFiles(rootFolderId: string) {
  const files = await listCloneFiles(rootFolderId);
  const metaFile = findSavedInvitationMetaFile(files);
  const meta = metaFile ? await loadInvitationMetaByFileId(metaFile.id) : null;
  const dataFile = findSavedInvitationDataFile(files, meta?.dataJsonFileId);
  return { files, meta, dataFile };
}

export async function getAudienceIndexRootDataId(folderId: string) {
  const folder = await getDriveFile(folderId);
  if (
    folder?.appProperties?.app_id !== APP_IDENTIFIER ||
    folder.appProperties.kind !== INVITATION_KIND ||
    !folder.ownedByMe ||
    folder.trashed
  )
    return null;
  const { dataFile } = await readRootInvitationFiles(folderId);
  return dataFile?.id ?? null;
}

async function loadRootInvitation(rootFolderId: string, publicOrigin: string) {
  const { files, meta, dataFile } = await readRootInvitationFiles(rootFolderId);
  if (!dataFile) {
    throw new InvitationCloneError(
      '저장된 초대장 데이터를 찾을 수 없습니다.',
      404
    );
  }

  return {
    files,
    dataJsonFileId: dataFile.id,
    rootGuestUrl: await resolveRootGuestUrl(
      publicOrigin,
      dataFile.id,
      meta?.guestUrl
    ),
    published: meta?.published === true,
  };
}

export async function getAudienceEditorOptions(rootFolderId: string) {
  await assertInvitationFolderAccess(rootFolderId, {
    ownedOnly: true,
    allowAudience: false,
  });
  const files = await listCloneFiles(rootFolderId, [
    `appProperties has { key='kind' and value='${AUDIENCE_KIND}' }`,
  ]);
  return files.flatMap(file => {
    const audience = readAudienceFolder(file);
    return file.ownedByMe && audience?.rootFolderId === rootFolderId
      ? [audience.group]
      : [];
  });
}

export async function getInvitationAudiences(
  folderId: string,
  publicOrigin: string
): Promise<AudienceGroupList> {
  const selection = await assertInvitationFolderAccess(folderId, {
    ownedOnly: true,
  });
  const { rootFolderId, rootInvitationUuid: rootUuid } = selection;
  if (!rootUuid)
    throw new InvitationCloneError('초대장 편집 정보를 찾을 수 없습니다.', 404);

  const { files, dataJsonFileId, rootGuestUrl } = await loadRootInvitation(
    rootFolderId,
    publicOrigin
  );
  const groups: AudienceGroup[] = [
    {
      name: '기본',
      slug: '',
      folderId: rootFolderId,
      invitationUuid: rootUuid,
    },
  ];
  const audiences = await inCloneBatches(
    files.filter(file => file.appProperties?.kind === AUDIENCE_KIND),
    async file => {
      const audience = readAudienceFolder(file);
      if (audience?.rootFolderId !== rootFolderId || !file.ownedByMe)
        return null;
      if (!(await resolveAudienceLink(dataJsonFileId, audience.group.slug))) {
        await restoreAudienceLink(
          dataJsonFileId,
          audience.group,
          file.appProperties?.clone_request
        );
      }
      return audience.group;
    }
  );
  groups.push(
    ...audiences.filter((group): group is AudienceGroup => group !== null)
  );

  return { rootGuestUrl, groups, activeSlug: selection.audience?.slug ?? '' };
}

async function restoreAudienceLink(
  rootDataId: string,
  group: AudienceGroup,
  requestId?: string,
  currentDataId?: string
) {
  if (!requestId)
    throw new InvitationCloneError(
      '하객 그룹의 링크 정보를 찾을 수 없습니다.',
      503
    );
  const dataId =
    currentDataId ??
    findSavedInvitationDataFile(await listCloneFiles(group.folderId))?.id;
  if (!dataId)
    throw new InvitationCloneError(
      '하객 그룹의 저장 정보를 불러오지 못했습니다.',
      503
    );
  const claim = await claimAudienceLink(rootDataId, {
    name: group.name,
    slug: group.slug,
    requestId,
  });
  if (claim.status !== 'claimed' && claim.status !== 'existing') {
    throw new InvitationCloneError(
      '하객 그룹의 링크 정보를 다시 불러와 주세요.',
      503
    );
  }
  await commitAudienceLink(rootDataId, {
    slug: group.slug,
    requestId,
    dataJsonFileId: dataId,
  });
}

export async function createInvitationAudience(input: {
  folderId: string;
  sourceFolderId: string;
  name: string;
  slug: string;
  requestId: string;
  publicOrigin: string;
}) {
  const { folderId, sourceFolderId, name, slug, requestId, publicOrigin } =
    input;
  const selection = await assertInvitationFolderAccess(folderId, {
    ownedOnly: true,
  });
  const source =
    sourceFolderId === folderId
      ? selection
      : await assertInvitationFolderAccess(sourceFolderId, { ownedOnly: true });
  const { rootFolderId } = selection;
  if (source.rootFolderId !== rootFolderId) {
    throw new InvitationCloneError(
      '같은 초대장의 하객 그룹을 선택해 주세요.',
      404
    );
  }

  const root = await loadRootInvitation(rootFolderId, publicOrigin);
  const requestKey = createCloneRequestKey(
    rootFolderId,
    sourceFolderId,
    requestId
  );
  const comparedName = normalizeAudienceNameForComparison(name);
  const previous = root.files.filter(file => {
    const props = file.appProperties;
    return (
      props?.audience_root === rootFolderId &&
      props.clone_request !== requestKey &&
      (props.audience_slug === slug ||
        (props.audience_name &&
          normalizeAudienceNameForComparison(props.audience_name) ===
            comparedName))
    );
  });
  const duplicate = previous.find(file => readAudienceFolder(file));
  if (duplicate) {
    const message =
      duplicate.appProperties?.audience_slug === slug
        ? '이미 사용 중인 링크 이름입니다.'
        : '이미 같은 이름의 하객 그룹이 있습니다.';
    throw new InvitationCloneError(message, 409);
  }

  const claim = await claimAudienceLink(root.dataJsonFileId, {
    name,
    slug,
    requestId: requestKey,
  });
  if (claim.status === 'duplicate-slug') {
    throw new InvitationCloneError('이미 사용 중인 링크 이름입니다.', 409);
  }
  if (claim.status === 'duplicate-name') {
    throw new InvitationCloneError(
      '이미 같은 이름의 하객 그룹이 있습니다.',
      409
    );
  }
  if (claim.status === 'request-conflict') {
    throw new InvitationCloneError(
      '새 요청으로 하객 그룹을 추가해 주세요.',
      409
    );
  }
  const releaseClaim = async () => {
    try {
      await releaseAudienceLink(root.dataJsonFileId, {
        slug,
        requestId: requestKey,
      });
    } catch (error) {
      captureDriveError({ error, operation: 'drive_audience_release' });
    }
  };

  // 만료된 다른 요청이 남긴 하위 임시 폴더는 새 복제 전에 정리한다.
  try {
    for (const file of previous) {
      if (file.ownedByMe && file.appProperties?.kind === AUDIENCE_STAGE_KIND) {
        if (Date.now() - Date.parse(file.createdTime) < 3 * 60 * 1000) {
          throw cloneInProgress();
        }
        await deleteCloneFile(file.id);
      }
    }
  } catch (error) {
    await releaseClaim();
    throw error;
  }

  const invite = await cloneOwnedInvitation({
    sourceFolderId,
    parentId: rootFolderId,
    requestKey,
    folderName: name,
    stagingKind: AUDIENCE_STAGE_KIND,
    destinationKind: AUDIENCE_KIND,
    invitationUuid: AUDIENCE_UUID_PREFIX + generateUuid(),
    folderProperties: {
      audience_root: rootFolderId,
      audience_slug: slug,
      audience_name: name,
    },
    createGuestUrl: () => buildAudienceGuestUrl(root.rootGuestUrl, slug),
    onCleanFailure: releaseClaim,
  });
  if (!invite.dataJsonFileId || !invite.invitationUuid) {
    throw new InvitationCloneError(
      '하객 그룹의 저장 정보를 불러오지 못했습니다.',
      503
    );
  }
  await commitAudienceLink(root.dataJsonFileId, {
    slug,
    requestId: requestKey,
    dataJsonFileId: invite.dataJsonFileId,
  });

  const group: AudienceGroup = {
    name: invite.name,
    slug,
    folderId: invite.folderId,
    invitationUuid: invite.invitationUuid,
  };
  return { group, rootGuestUrl: root.rootGuestUrl };
}

/** A group can save its own content, while its root controls link visibility. */
export async function getOwnedAudienceLink(
  folderId: string,
  publicOrigin: string
) {
  const folder = await getDriveFile(folderId);
  if (!folder || !isInvitationAuxiliaryFolder(folder.appProperties?.kind))
    return null;
  const audience = readAudienceFolder(folder);
  if (!audience || !folder.ownedByMe) {
    throw new InvitationCloneError('하객 그룹을 찾을 수 없습니다.', 404);
  }
  await assertInvitationFolderAccess(audience.rootFolderId, {
    ownedOnly: true,
    allowAudience: false,
  });
  const root = await loadRootInvitation(audience.rootFolderId, publicOrigin);
  return {
    ...audience,
    requestId: folder.appProperties?.clone_request,
    rootDataJsonFileId: root.dataJsonFileId,
    guestUrl: buildAudienceGuestUrl(root.rootGuestUrl, audience.group.slug),
    published: root.published,
  };
}

export async function updateAudienceLinkTarget(
  audience: NonNullable<Awaited<ReturnType<typeof getOwnedAudienceLink>>>,
  suppliedDataId?: string
) {
  const files = await listCloneFiles(audience.group.folderId);
  const data = findSavedInvitationDataFile(files);
  if (!data || (suppliedDataId && data.id !== suppliedDataId.trim())) {
    throw new InvitationCloneError(
      '하객 그룹의 저장 정보를 확인해 주세요.',
      400
    );
  }

  const { rootDataJsonFileId, group } = audience;
  const previousId = await resolveAudienceLink(rootDataJsonFileId, group.slug);
  if (previousId === data.id) return data.id;
  if (previousId) {
    await refreshAudienceLink(rootDataJsonFileId, {
      slug: group.slug,
      dataJsonFileId: data.id,
    });
  } else {
    await restoreAudienceLink(
      rootDataJsonFileId,
      group,
      audience.requestId,
      data.id
    );
  }
  return data.id;
}
